const isDefined = (obj) => {
    return obj !== undefined && obj !== null;
};
const getLastCount = async (model, opts, groupByField = {}) => {
    const initCount = opts.startAt - opts.incrementBy;
    const query = {};
    if (opts?.groupBy) {
        Object.assign(query, groupByField);
    }
    const last = await model.findOne(query).select(`${opts.field}`).sort({ _id: -1 });
    if (!last) {
        return initCount;
    }
    return Number(last[opts.field] || initCount);
};

const resetCount = async (model, opts, groupByField = {}) => {
    const query = {};
    if (opts?.groupBy) {
        Object.assign(query, groupByField);
    }
    const set = {};
    set[opts.field] = `${opts.startAt}`.padStart(opts.digits, '0');
    return model.findOneAndUpdate(query, {
        $set: set
    }, {
        returnDocument: 'after',
        sort: { _id: -1 }
    });
};

const manageField = (schema, opts) => {
    const dataField = schema.path(opts.field);
    if (dataField) {
        if (!(dataField.instance === 'String')) {
            throw Error('Field must be type of string');
        }
    } else {
        const field = {};
        field[opts.field] = {
            type: String
        };
        schema.add(field);
    }
};

const autoInc = (schema, pluginOpts = {}) => {
    const opts = {
        field: 'id',
        digits: 5,
        startAt: 0,
        incrementBy: 1,
        unique: false
    };
    Object.assign(opts, pluginOpts);

    manageField(schema, opts);

    if (opts.unique) {
        const index = {};
        index[opts.field] = 1;
        if (opts?.groupBy) {
            if (Array.isArray(opts.groupBy)) {
                // eslint-disable-next-line no-return-assign
                opts.groupBy.forEach((g) => index[g] = 1);
            } else {
                index[opts.groupBy] = 1;
            }
        }
        schema.index(index, { unique: true, index: -1 });
    }

    schema.pre('save', async function (next) {
        if (this.isNew) {
            const groupByField = {};
            if (opts?.groupBy) {
                if (Array.isArray(opts.groupBy)) {
                    for (const groupByElement of opts.groupBy) {
                        if (!isDefined(this[groupByElement])) {
                            return next(Error(`${groupByElement} must be filled on before save`));
                        }
                        groupByField[groupByElement] = this[groupByElement];
                    }
                } else {
                    if (!isDefined(this[opts.groupBy])) {
                        return next(Error('groupBy field must be filled on before save'));
                    }
                    groupByField[opts.groupBy] = this[opts.groupBy];
                }
            }
            const count = await getLastCount(this.constructor, opts, groupByField);
            this[opts.field] = `${count + opts.incrementBy}`.padStart(opts.digits, '0');
        }
        return next();
    });
    schema.method('nextCount', async function () {
        const groupByField = {};
        if (opts?.groupBy) {
            if (Array.isArray(opts.groupBy)) {
                for (const groupByElement of opts.groupBy) {
                    if (!isDefined(this[groupByElement])) {
                        throw Error(`${groupByElement} must be filled on before save`)
                    }
                    groupByField[groupByElement] = this[groupByElement];
                }
            } else {
                if (!isDefined(this[opts.groupBy])) {
                    throw Error('groupBy field must be filled');
                }
                groupByField[opts.groupBy] = this[opts.groupBy];
            }
        }
        const count = await getLastCount(this.constructor, opts, groupByField);
        return `${count + opts.incrementBy}`.padStart(opts.digits, '0');
    });
    schema.static('nextCount', async function (groupByFieldNext) {
        const groupByField = {};
        if (opts?.groupBy) {
            if (typeof groupByFieldNext === 'string') {
                groupByField[opts.groupBy] = groupByFieldNext;
            } else if (typeof groupByFieldNext === 'object') {
                Object.assign(groupByField, groupByFieldNext);
            }
        }
        const count = await getLastCount(this, opts, groupByField);
        return `${count + opts.incrementBy}`.padStart(opts.digits, '0');
    });
    schema.static('resetCount', async function (groupByFieldNext) {
        const groupByField = {};
        if (opts?.groupBy) {
            if (typeof groupByFieldNext === 'string') {
                groupByField[opts.groupBy] = groupByFieldNext;
            } else if (typeof groupByFieldNext === 'object') {
                Object.assign(groupByField, groupByFieldNext);
            }
        }
        return resetCount(this, opts, groupByField);
    });
};

module.exports = {
    autoInc
};
