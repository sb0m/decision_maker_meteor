/**
 * Mongo Collection options
 */
Options = new Mongo.Collection("options");

let schemaOptions = new SimpleSchema({
    name: {
        type: String
    },
    selected: {
        type: Boolean
    }
});

let schemaIdObject = new SimpleSchema({
    id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    }
});

let schemaTriggerDecision = new SimpleSchema({
    oldSel: {
        type: String,
        optional: true
    }
});

Options.attachSchema(schemaOptions);
  
// Prevent client side database manipulations
Options.allow({
    insert: () => false,
    update: () => false,
    remove: () => false
});
Options.deny({
    insert: () => true,
    update: () => true,
    remove: () => true
});

/* Provide helper to have access to the collection
Options.helpers({
    something() {
        return something;
    }
});*/

Options.API = {
    getNumberOfOptions: function () {
        return Options.find({}).count();
    },
    createOption: new ValidatedMethod({
        name: 'option.create',
        validate: schemaOptions.validator({ clean: true, filter: false }),
        run({name, selected}) {
            try {
                Options.insert({
                    name: name,
                    selected: selected
                });
            } catch (err) {
                return err;
            }
        }
    }),
    deleteOption: new ValidatedMethod({
        name: 'option.delete',
        validate: schemaIdObject.validator({ clean: true, filter: false }),
        run(idObject) {
            try {
                Options.remove({ "_id": idObject.id });
            } catch (err) {
                return err;
            }
        }
    }),
    triggerDecision: new ValidatedMethod({
        name: 'option.trigger.decision',
        validate: schemaTriggerDecision.validator({ clean: true, filter: false }),
        run(oldSelection) {
            let newSelection;
            try {
                // old selection undefined when no selection made yet
                if (oldSelection.oldSel !== undefined) {
                    Options.update({ _id: oldSelection.oldSel }, { $set: { selected: false } });
                }
                var randomNumber = (new Date().getMilliseconds()) % Options.find({}).count();
                newSelection = Options.findOne({}, { skip: randomNumber, limit: 1 });
                Options.update({ _id: newSelection['_id'] }, { $set: { selected: true } });
            }
            catch (err) {
                console.log(err.message);
            }
            return newSelection;
        }
    })
};