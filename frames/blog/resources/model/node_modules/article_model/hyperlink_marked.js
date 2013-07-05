var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var regex =  /\?\[([^\]]+)\]\(([^\)]+)\)/gi;

var link_template = _.template('<a href="/blog/<%= file_name %>"><%= link_text %></a>');

/* ********* EXPORTS ******** */

module.exports = function (text, context) {
	var folder = context.hasOwnProperty('folder') ? context.folder : '';
	var my_folder, file_name, link_text;
	do {

		var match = regex.exec(text);
		//console.log('text: %s, match: %s', text, util.inspect(match));
		if (!match) return text;

		var find = match[0];

		file_name = match[2];
		if (folder && !/\//.test(file_name)){
			file_name = folder + '/' + file_name;
		}
		link_text = match[1];

		var replacement = link_template({
			file_name: file_name,
			link_text: link_text
		});

		text = text.replace(find, replacement);
	} while (match);
	return text;

}; // end export function