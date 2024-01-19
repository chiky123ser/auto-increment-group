# mongoose auto incremente

- Mongoose plugin that auto increments any ID field on your schema when a document is saved for the first time.

1. [installation.](#id1)
2. [Getting Started.](#id2)

## installation <a name="id1"></a>

```
npm install auto-increment-group
```

## Getting Started <a name="id2"></a>

```javascript
import mongoose from 'mongoose';
import { autoInc } from 'auto-increment-group';

const schema = new mongoose.Schema({
    serialNumber: {
        type: String
    },
    name: {
        type: String
    },
    company: {
        type: String
    },
}, {
    timestamps: true
});

const Document = connection.model('Document', schema);

schema.plugin(autoInc, {
    field: "serialNumber",
    groupBy: 'company',
    digits: 4,
    startAt: 1,
    incrementBy: 1,
    unique: false
});

let document1_1 = new Document({ name: 'document1_1', company: '1'});
let document1_2 = new Document({ name: 'document1_2', company: '1'});
let document2_1 = new Document({ name: 'document2_1', company: '2'});

await document1_1.save() // { serialNumber: "0001", name: 'document1_1', company: '1' }
await document1_2.save() // { serialNumber: "0002", name: 'document1_2', company: '1' }
await document2_1.save() // { serialNumber: "0001", name: 'document2_1', company: '2' }

```

### Plugin Options

| Option      | Type           | Default | Descripción                                            | 
|-------------|----------------|---------|--------------------------------------------------------|
| field       | String         | id      | field to increment.                                    |
| digits      | Number         | 5       | field size to increment.                               |
| startAt     | Number         | 0       | value with which the count begins.                     |
| incrementBy | Number         | 1       | count increment.                                       |
| unique      | Boolean        | false   | Create a unique index using the "field" and "groupBy". |
| groupBy     | string / Array |         | Field by which different increments can be carried.    |

> The "Group by" field is optional, if it is not present, the auto increment will be applied to all documents in the schema

### Multiple group by

```javascript
import mongoose from 'mongoose';
import { autoInc } from 'auto-increment-group';

const schema = new mongoose.Schema({
    serialNumber: {
        type: String
    },
    name: {
        type: String
    },
    company: {
        type: String
    },
    floor: {
        type: String
    }
}, {
    timestamps: true
});

const Document = connection.model('Document', schema);

schema.plugin(autoInc, {
    field: "serialNumber",
    groupBy: ['company',  'floor'],
    digits: 4,
    startAt: 1,
    incrementBy: 1,
    unique: false
});

let document1 = new Document({ name: 'document1C1F1', company: '1', floor: '1'});
let document2 = new Document({ name: 'document2C1F1', company: '1', floor: '1'});
let document3 = new Document({ name: 'document1C1F2', company: '1', floor: '2'});
let document4 = new Document({ name: 'document1C2F1', company: '2', floor: '1'});

await document1.save() // { serialNumber: "0001", name: 'document1C1F1', company: '1', floor: '1' }
await document2.save() // { serialNumber: "0002", name: 'document2C1F1', company: '1', floor: '1' }
await document3.save() // { serialNumber: "0001", name: 'document1C1F2', company: '2', floor: '2' }
await document4.save() // { serialNumber: "0001", name: 'document1C2F1', company: '2', floor: '1' }

```

### NextCount

nextCount is both a static method on the model and an instance method on the document.
If the _groupBy_ option is present, for the static function, the discriminant must be passed as a parameter
> if the _groupBy_ is multiple, an object must be passed with the discriminates

> The nextCount function returns a promise 

```javascript
let document1 = new Document({ name: 'document1_1', company: '1'});
await document.nextCount();

await Document.nextCount('1');
await Document.nextCount('2');
await Document.nextCount({
    company: '1', 
    floor: '1'
});

// A mongoose session may be passed to the static method as a second parameter.
const session = await mongoose.connection.startSession();
session.startTransaction();

await Document.nextCount('1', session);
await Document.nextCount('2', session);
await Document.nextCount({
    company: '1', 
    floor: '1'
}, session);
```

### resetCount

resetCount is static method on the model.
The reset function can receive a discriminant as a parameter, which will only reset the count belonging to the discriminant

> if the _groupBy_ is multiple, an object must be passed with the discriminates

> The resetCount function returns a promise

```javascript
await Document.resetCount();
await Document.resetCount('1');
await Document.resetCount({
    company: '1',
    floor: '1'
});


// A mongoose session may be passed as a second parameter.
const session = await mongoose.connection.startSession();
session.startTransaction();


await Document.resetCount(session);
await Document.resetCount('1', session);
await Document.resetCount({
    company: '1',
    floor: '1'
}, session);
```

