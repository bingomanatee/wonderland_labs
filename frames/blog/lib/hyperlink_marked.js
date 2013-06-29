var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var pathRE = /^(.*)\/([^\/]+)/;

var link_template = _.template('<a href="/blog/<%= folder ? folder + "/" : "" %><%= file_name %>"><%= link_text %></a>');

/* ********* EXPORTS ******** */

module.exports = function (text, context) {

	var regex2 = new RegExp('\\[\\[([\\w\\/]+)\\]\\]');
	var regex =  new RegExp('\\[\\[([\\w\\/]+)\\]\\](\\(([^\)]*)\\))');

	var folder = context.hasOwnProperty('folder') ? context.folder : '';
	var my_folder, file_name, link_text;
	do {

		var match = regex.exec(text);
		if (!match) {
			match = regex2.exec(text);
			if(!match) return text;
		}

		console.log('match: %s', util.inspect(match));

		var find = match[0];

		file_name = match[1];
		if (pathRE.test(file_name)){
			var m2 = pathRE.exec(file_name);
			my_folder = m2[1];
			file_name = m2[2];
		} else {
			my_folder = folder;
		}

		link_text = match[3] || file_name;

		var replacement = link_template({
			file_name: file_name,
			link_text: link_text,
			folder: my_folder
		});

		text = text.replace(find, replacement);
	} while (match);
	return text;

}; // end export function