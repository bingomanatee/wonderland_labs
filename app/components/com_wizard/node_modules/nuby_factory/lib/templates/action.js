module.exports = {

<%
[false, 'get', 'post', 'put', 'delete'].forEach(function(method){
 on_validate = method ? validate[method] : validate.on;
 on_input = method ? input[method] : input.on;
 on_process = method ? process[method] : process.on;
 on_output = method ? output[method] : output.on;
 %><% if (method && comment){ %>

/* ****** <%= method.toUpperCase() %> ****** */

<% } %><%
if (on_validate) {%>

<%- on_validate %>,
<%
} // on validate
%>
<%
if (on_input) { %>
<%- on_input %>,
<%
} // end on_input
%>
<%
if (on_process) {
%>
<%- on_process %>,
<%
} // end on_process
%>
<% if (on_output){%>
[output]<%- on_output %>,
<% } %>
<%}) %>
    a:'a' // last comma
}