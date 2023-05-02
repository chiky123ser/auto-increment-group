const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { mongoose } = require('mongoose');
const { autoInc } = require('../lib/autoInc.js');

chai.use(chaiAsPromised);
const { Schema } = mongoose;
let mongoDb;

before(async () => {
    mongoDb = await mongoose.connect('mongodb://127.0.0.1:27017/test-auth', {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
});

afterEach(async () => {
    await mongoDb.connection.collections.users.deleteMany({});
    delete mongoDb.models.User;
});

describe('auto-increment-mongoose', () => {
    describe('auto increment simple', () => {
        it('should increment the id field on save', async () => {
            const schema = new Schema({
                name: String,
                department: String
            });

            schema.plugin(autoInc, {});
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Erik', department: 'development' });
            const user2 = new User({ name: 'Kyle', department: 'Operations' });
            await user1.save();
            await user2.save();
            chai.expect(user1.id).to.be.equal('00000');
            chai.expect(user2.id).to.be.equal('00001');
        });

        it('should increment the specified field on save', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio'
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Stan', department: 'development' });
            const user2 = new User({ name: 'Kenny', department: 'Operations' });
            await user1.save();
            await user2.save();
            chai.expect(user1.folio).to.be.equal('00000');
            chai.expect(user2.folio).to.be.equal('00001');
        });

        it('should start counting at specified number', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                startAt: 10,
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Stan', department: 'development' });
            const user2 = new User({ name: 'Sharon', department: 'Operations' });
            await user1.save();
            await user2.save();
            chai.expect(user1.folio).to.be.equal('00010');
            chai.expect(user2.folio).to.be.equal('00011');
        });

        it('should increment by the specified amount', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                startAt: 10,
                incrementBy: 100,
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Randy', department: 'development' });
            const user2 = new User({ name: 'Kenny', department: 'Operations' });
            await user1.save();
            await user2.save();
            chai.expect(user1.folio).to.be.equal('00010');
            chai.expect(user2.folio).to.be.equal('00110');
        });
    });

    describe('auto increment groupBy', () => {
        it('should increment the id field on save', async () => {
            const schema = new Schema({
                name: String,
                department: String
            });

            schema.plugin(autoInc, {
                groupBy: 'department'
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Erik', department: 'development' });
            const user2 = new User({ name: 'Scott', department: 'development' });
            const user3 = new User({ name: 'Kyle', department: 'Operations' });
            await user1.save();
            await user2.save();
            await user3.save();
            chai.expect(user1.id).to.be.equal('00000');
            chai.expect(user2.id).to.be.equal('00001');
            chai.expect(user3.id).to.be.equal('00000');
        });

        it('should increment the specified field on save', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                groupBy: 'department'
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Stan', department: 'development' });
            const user2 = new User({ name: 'Kenny', department: 'Operations' });
            const user3 = new User({ name: 'Butters', department: 'Operations' });
            await user1.save();
            await user2.save();
            await user3.save();
            chai.expect(user1.folio).to.be.equal('00000');
            chai.expect(user2.folio).to.be.equal('00000');
            chai.expect(user3.folio).to.be.equal('00001');
        });

        it('should start counting at specified number', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                startAt: 10,
                groupBy: 'department'
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Stan', department: 'development' });
            const user2 = new User({ name: 'Sharon', department: 'Operations' });
            const user3 = new User({ name: 'Sharon', department: 'Operations' });
            await user1.save();
            await user2.save();
            await user3.save();
            chai.expect(user1.folio).to.be.equal('00010');
            chai.expect(user2.folio).to.be.equal('00010');
            chai.expect(user3.folio).to.be.equal('00011');
        });

        it('should increment by the specified amount', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                startAt: 10,
                incrementBy: 100,
                groupBy: 'department'
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Randy', department: 'development' });
            const user2 = new User({ name: 'Kenny', department: 'Operations' });
            const user3 = new User({ name: 'Linda', department: 'Operations' });
            await user1.save();
            await user2.save();
            await user3.save();
            chai.expect(user1.folio).to.be.equal('00010');
            chai.expect(user2.folio).to.be.equal('00010');
            chai.expect(user3.folio).to.be.equal('00110');
        });
    });

    describe('auto increment groupBy multiple', () => {
        it('should increment the id field on save', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                floor: String
            });

            schema.plugin(autoInc, {
                groupBy: ['department', 'floor'],
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Erik', department: 'development', floor: '1' });
            const user2 = new User({ name: 'Scott', department: 'development', floor: '1' });

            const user3 = new User({ name: 'Kenny', department: 'development', floor: '2' });
            const user4 = new User({ name: 'Leopold', department: 'development', floor: '2' });

            const user5 = new User({ name: 'Kyle', department: 'Operations', floor: '1' });

            await user1.save();
            await user2.save();
            await user3.save();
            await user4.save();
            await user5.save();

            chai.expect(user1.id).to.be.equal('00000');
            chai.expect(user2.id).to.be.equal('00001');
            chai.expect(user3.id).to.be.equal('00000');
            chai.expect(user4.id).to.be.equal('00001');
            chai.expect(user5.id).to.be.equal('00000');
        });

        it('should increment the specified field on save', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                floor: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                groupBy: ['department', 'floor']
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Erik', department: 'development', floor: '1' });
            const user2 = new User({ name: 'Scott', department: 'development', floor: '1' });

            const user3 = new User({ name: 'Kenny', department: 'development', floor: '2' });
            const user4 = new User({ name: 'Leopold', department: 'development', floor: '2' });

            const user5 = new User({ name: 'Kyle', department: 'Operations', floor: '1' });

            await user1.save();
            await user2.save();
            await user3.save();
            await user4.save();
            await user5.save();

            chai.expect(user1.folio).to.be.equal('00000');
            chai.expect(user2.folio).to.be.equal('00001');
            chai.expect(user3.folio).to.be.equal('00000');
            chai.expect(user4.folio).to.be.equal('00001');
            chai.expect(user5.folio).to.be.equal('00000');
        });

        it('should start counting at specified number', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                floor: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                startAt: 10,
                groupBy: ['department', 'floor']
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Erik', department: 'development', floor: '1' });
            const user2 = new User({ name: 'Scott', department: 'development', floor: '1' });

            const user3 = new User({ name: 'Kenny', department: 'development', floor: '2' });
            const user4 = new User({ name: 'Leopold', department: 'development', floor: '2' });

            const user5 = new User({ name: 'Kyle', department: 'Operations', floor: '1' });

            await user1.save();
            await user2.save();
            await user3.save();
            await user4.save();
            await user5.save();

            chai.expect(user1.folio).to.be.equal('00010');
            chai.expect(user2.folio).to.be.equal('00011');
            chai.expect(user3.folio).to.be.equal('00010');
            chai.expect(user4.folio).to.be.equal('00011');
            chai.expect(user5.folio).to.be.equal('00010');
        });

        it('should increment by the specified amount', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                floor: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                startAt: 10,
                incrementBy: 100,
                groupBy: ['department', 'floor']
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Erik', department: 'development', floor: '1' });
            const user2 = new User({ name: 'Scott', department: 'development', floor: '1' });

            const user3 = new User({ name: 'Kenny', department: 'development', floor: '2' });
            const user4 = new User({ name: 'Leopold', department: 'development', floor: '2' });

            const user5 = new User({ name: 'Kyle', department: 'Operations', floor: '1' });

            await user1.save();
            await user2.save();
            await user3.save();
            await user4.save();
            await user5.save();

            chai.expect(user1.folio).to.be.equal('00010');
            chai.expect(user2.folio).to.be.equal('00110');
            chai.expect(user3.folio).to.be.equal('00010');
            chai.expect(user4.folio).to.be.equal('00110');
            chai.expect(user5.folio).to.be.equal('00010');
        });
    });

    describe('auto increment digits', () => {
        it('should increment the field on save change digits', async () => {
            const schema = new Schema({
                name: String,
                department: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                groupBy: 'department',
                digits: 3
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Erik', department: 'development' });
            await user1.save();
            chai.expect(user1.folio).to.be.equal('000');
        });
    });

    describe('next Count', () => {
        it('should get last count method', async () => {
            const schema = new Schema({
                name: String,
                department: String,
            });

            schema.plugin(autoInc, {
                field: 'folio',
                groupBy: 'department'
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Erik', department: 'development' });
            await user1.save();
            chai.expect(user1.folio).to.be.equal('00000');
            const nextCount = await user1.nextCount();
            chai.expect(nextCount).be.equal('00001');
        });

        it('should get last count groupBy multiple method', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                floor: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                groupBy: ['department', 'floor'],
            });
            const User = mongoDb.model('User', schema);

            const user1 = new User({ name: 'Erik', department: 'development', floor: '1' });
            await user1.save();
            chai.expect(user1.folio).to.be.equal('00000');
            const nextCount = await user1.nextCount();
            chai.expect(nextCount).be.equal('00001');
        });

        it('should get last count static', async () => {
            const schema = new Schema({
                name: String,
                department: String,
            });

            schema.plugin(autoInc, {
                field: 'folio',
                groupBy: 'department'
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Erik', department: 'development' });
            await user1.save();
            chai.expect(user1.folio).to.be.equal('00000');
            const nextCount = await User.nextCount('development');
            chai.expect(nextCount).be.equal('00001');
        });

        it('should get last count groupBy multiple static', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                floor: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                groupBy: ['department', 'floor'],
            });
            const User = mongoDb.model('User', schema);

            const user1 = new User({ name: 'Erik', department: 'development', floor: '1' });
            await user1.save();
            chai.expect(user1.folio).to.be.equal('00000');
            const nextCount = await User.nextCount({
                department: 'development',
                floor: '1',
            });
            chai.expect(nextCount).be.equal('00001');
        });
    });

    describe('reset Count', () => {
        it('should get last count static', async () => {
            const schema = new Schema({
                name: String,
                department: String,
            });

            schema.plugin(autoInc, {
                field: 'folio',
                groupBy: 'department'
            });
            const User = mongoDb.model('User', schema);
            const user1 = new User({ name: 'Erik', department: 'development' });
            await user1.save();
            chai.expect(user1.folio).to.be.equal('00000');
            await User.resetCount('development');
            const user2 = new User({ name: 'Stan', department: 'development' });
            await user2.save();
            chai.expect(user1.folio).to.be.equal('00000');
        });

        it('should get last count groupBy multiple static', async () => {
            const schema = new Schema({
                name: String,
                department: String,
                floor: String,
                folio: String
            });

            schema.plugin(autoInc, {
                field: 'folio',
                groupBy: ['department', 'floor'],
            });
            const User = mongoDb.model('User', schema);

            const user1 = new User({ name: 'Erik', department: 'development', floor: '2' });
            const user2 = new User({ name: 'Stan', department: 'development', floor: '2' });
            const user3 = new User({ name: 'Kyle', department: 'development', floor: '2' });
            const user4 = new User({ name: 'Randy', department: 'development', floor: '1' });
            const user5 = new User({ name: 'Chef', department: 'development', floor: '1' });
            await user1.save();
            await user2.save();
            await user4.save();
            chai.expect(user1.folio).to.be.equal('00000');
            chai.expect(user2.folio).to.be.equal('00001');
            chai.expect(user4.folio).to.be.equal('00000');
            await User.resetCount({
                department: 'development',
                floor: '2',
            });
            await user3.save();
            await user5.save();
            chai.expect(user3.folio).to.be.equal('00001');
            chai.expect(user5.folio).to.be.equal('00001');
        });
    });
});

after(async () => {
    await mongoDb.connection.collections.users.drop();
    await mongoDb.connection.db.dropDatabase();
    mongoose.connection.close();
});
