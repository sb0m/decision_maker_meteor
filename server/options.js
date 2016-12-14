Meteor.publish('options.public', () => {
	return Options.find({});
});