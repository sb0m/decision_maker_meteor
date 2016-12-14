Template.body.onCreated(() => {
    Template.instance().subscribe('options.public');
});

Template.body.helpers({
    options: function () {
        return Options.find({});
    },
    selectedOption: function () {
        /**
         * Session variable used for asynchronous update, otherwise the template gets rendered
         * multiple times during the update of the new selected option
         * let sel = Options.findOne({selected: true}, { fields: {name: 1 }});
         */
        let option = "No decision made yet";
        if (Options.API.getNumberOfOptions() <= 0) {
            option = "No options yet";
        }
        else if (Options.findOne({ selected: true }) === undefined) {
            option = "No decision made yet";
        }
        else if (Session.get("selected") !== undefined) {
            option = Session.get("selected").name;
        }
        return option;
    },
    optionCount: function () {
        return (Options.API.getNumberOfOptions() <= 0);
    }
});

Template.body.events({
    "click .addOption": function (event) {
        // Prevent default browser submit
        event.preventDefault();
        $('.small.modal.newOption')
            .modal({
                closable: true,
                onDeny: function () {
                    return true;
                },
                onApprove: function () {
                    var newOption = $('input[name="addOption"]').val();
                    Options.API.createOption.call({ name: newOption, selected: false }, (err, res) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    $('input[name="addOption"]').val("");
                }
            })
            .modal('show');
    },
    /**
     * Workaround: Class removal does not work in the same function as the class adding   
     * */
    "mouseup .makeDecision": function () {
        $('.selectedItem').removeClass('animate');
    },
    "click .makeDecision": function () {
        let oldSelection = Options.findOne({ selected: true }, { fields: { name: 1 } });
        let oldeSelectionId;
        if (oldSelection !== undefined) {
            oldeSelectionId = oldSelection['_id'];
        }
        // Trigger animation
        $('.selectedItem').addClass('animate');
        
        // Update Options
        Options.API.triggerDecision.call({ oldSel: oldeSelectionId }, (err, resp) => {
            if (err) {
                console.log(err);
            } else {
                Session.set("selected", resp);
            }
        });

    }
});


Template.optionTemplate.events({
    "click .deleteOptionButton": function (event) {
        event.preventDefault();
        var id = event.target.id;
        $('.small.modal.deleteOption')
            .modal({
                closable: true,
                onDeny: function () {
                    return true;
                },
                onApprove: function () {
                    Options.API.deleteOption.call({ 'id': id }, (err, res) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            })
            .modal('show');
    }
});
