module.exports = {

<%
[false, 'get', 'post', 'put', 'delete'].forEach(function(method){
 on_validate = method ? validate[method] : validate.on;
 on_input = method ? input[method] : input.on;
 on_process = method ? process[method] : process.on;
 %><% if (method && comment){ %>

/* ****** <%= method.toUpperCase() %> ****** */

<% } %><%
if (on_validate) {
 if (on_validate === true ){
%>
    on_<% if (method){ %><%= method %>_<%}%>validate: function (rs){
        var self = this;this.on_<% if (method){ %><%= method %>_<%}%>input(rs);
        },
<%
  } else if (typeof(on_validate) == 'string'){ %>	on_<% if (method){ %><%= method %>_<%}%>validate: function (rs){
        <%- on_validate %>
        },
<%
  } else if (typeof(on_validate) == 'function'){
  %>	on_<% if (method){ %><%= method %>_<%}%>validate: <%- on_validate.toString() %>,
<%
} // end type check
} // end on_validate
%>
<%
if (on_input) {
 if (on_input === true ){
%>
    on_<% if (method){ %><%= method %>_<%}%>input: function (rs){
        var self = this;self.on_<% if (method){ %><%= method %>_<%}%>process(rs,rs.req_props);
        },
<%
  } else if (typeof(on_input) == 'string'){ %>on_<% if (method){ %><%= method %>_<%}%>input: function (rs){
        <%- on_input %>
        },
<%
  } else if (typeof(on_input) == 'function'){
  %>on_<% if (method){ %><%= method %>_<%}%>input: <%- on_input.toString() %>,
<%
} // end type check
} // end on_input
%>
<%
if (on_process) {
 if (on_process === true ){
%>

    on_<% if (method){ %><%= method %>_<%}%>process: function (rs){
        var self = this;self.on_<% if (method){ %><%= method %>_<%}%>output(rs,input);
        },
<%
  } else if (typeof(on_process) == 'string'){ %>on_<% if (method){ %><%= method %>_<%}%>process: function (rs,input){
        <%- on_process %>
        },
<%
  } else if (typeof(on_process) == 'function'){
  %>on_<% if (method){ %><%= method %>_<%}%>process: <%- on_process.toString() %>,
<%
} // end type check
%>
<%
} // end on_process
%><%}) %>
    a:'a' // last comma
}