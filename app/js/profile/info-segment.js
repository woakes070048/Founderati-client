/**
 * @jsx m
 */

var Editable = require('common/form-builder').inputs.editable;
var UserDetail = require('model/user-details');

var InfoSegment = function (detail, canEdit, userID) {
	var segment = {};

	segment.vm = {
		editing: m.prop(false),
		originalContent: m.prop()
	};

	segment.controller = function () {
		segment.vm.init();
	};

	function save() {
		UserDetail.patchByID(userID, [detail]).then(function() {
			segment.vm.editing(false);
		});
	}

	function revert() {
		detail.content.length = 0;
		Array.prototype.push.apply(detail.content, 
			new UserDetail.DetailModel({
				content: JSON.parse(segment.vm.originalContent()) // Hack
			}).content
		);

		segment.vm.editing(false);
		segment.vm.originalContent(undefined);
	}

	function startEditing() {
		segment.vm.editing(true);
		segment.vm.originalContent(JSON.stringify(detail.content)); // Hack
	}

	function viewEdit() {
		function addItem(sectionIndex) {
			var content = detail.content;
			return function() {
				if (!content[sectionIndex].subpoints) {
					content[sectionIndex].subpoints = [];
				}
				content[sectionIndex].subpoints.push({
					title: m.prop(''),
					description: m.prop('')
				});
			}
		}

		function addSection() {
			return function() {
				detail.content.push({
					title: m.prop(''),
					description: m.prop(''),
					subpoints: []
				});
			}
		}

		var items = detail.content.map(function(item, index) {
			var subpoints = null;
			if (item.subpoints) {
				subpoints = item.subpoints.map(function(point, pointIndex) {
					return (
						<div className="item">
							<i className="right triangle icon"></i>
							<div className="content subfield-editable">
								<div className="editable-item-container">
									<div className="header"
										config={Editable(point.title, {
											placeholder: 'Add a title',
											showbuttons: false,
											onblur: 'submit'
										})}>
										{point.title()}
									</div>
									<i className="close link icon"
										onclick={function() {
											item.subpoints.splice(pointIndex, 1);
										}}>
									</i>
									<div data-type="textarea"
										data-inputclass="ui fluid"
										config={Editable(point.description, {
											placeholder: 'Enter a description.',
											showbuttons: false,
											rows: 5,
											onblur: 'submit'
										})}>
										{point.description()}
									</div>
								</div>
							</div>
						</div>
					);
				});
			}
			return (
				<div className="item">
					<div className="editable-item-container">
						<div className="header"
							config={Editable(item.title, {
								placeholder: 'Add a title',
								showbuttons: false,
								onblur: 'submit'
							})}>
							{item.title()}
						</div>
						<div className="content">
							<div data-inputclass="ui fluid"
								data-type="textarea"
								config={Editable(item.description, {
									placeholder: 'Enter a description.',
									showbuttons: false,
									rows: 5,
									onblur: 'submit'
								})}>
								{item.description()}
							</div>
							<div className="list">
								{subpoints}
								<div className="item">
									<a onclick={addItem(index)}>
										<i className="right triangle icon"></i>
										+ Add item
									</a>
								</div>
							</div>
						</div>
						<i className="close link icon"
							onclick={function() {
								detail.content.splice(index, 1);
							}}>
						</i>
					</div>
				</div>
			);
		});

		return (
			<div className="ui list">
				{items}
				<div className="item">
					<a onclick={addSection()}>
						+ Add section
					</a>
				</div>
			</div>
		);
	}

	function viewRegular() {
		var items = detail.content.map(function(item) {
			var subpoints = null;
			if (item.subpoints) {
				subpoints = item.subpoints.map(function(point) {
					return (
						<div className="item">
							<i className="right triangle icon"></i>
							<div className="content">
								<div className="header">{point.title()}</div>
								<div className="description">{point.description()}</div>
							</div>
						</div>
					);
				});
			}
			return (
				<div className="item">
					<div className="header">{item.title()}</div>
					<div className="content">
						{item.description()}
						<div className="list">
							{subpoints}
						</div>
					</div>
				</div>
			);
		});

		return <div className="ui list">{items}</div>;
	}

	segment.view = function () {
		var sections = null;
		var editButton = null;
		if (canEdit) {
			if (segment.vm.editing()) {
				editButton = (
					<div className="mini ui buttons right floated">
						<div className="ui red button"
							onclick={revert}>
							Discard
						</div>
						<div className="ui blue button" onclick={save}>
							Save
						</div>
					</div>
				);
				sections = viewEdit();
			} else {
				editButton = (
					<div className="mini ui blue button right floated"
						onclick={startEditing}>
						Edit
					</div>
				);
			}
		}

		if (sections === null) {
			sections = viewRegular();
		}
		return (
			<div className="ui segment">
				<div className="ui ribbon label">
					<h4 className="ui header">{detail.title().toUpperCase()}</h4>
				</div>
				{editButton}
				{sections}
			</div>
		);
	};

	return segment;
};

module.exports = InfoSegment;
