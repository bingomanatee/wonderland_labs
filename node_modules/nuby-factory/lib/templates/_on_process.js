<%
if (on_process) {
 if (on_process === true ){
%>on_<% if (method){ %><%= method %>_<%}%>process: function (rs){var self = this;self.on_output(rs,input);},<%
  } else if (typeof(on_process) == 'string'){ %>on_<% if (method){ %><%= method %>_<%}%>process: function (rs,input){<%- on_process %>},<%
  } else if (typeof(on_process) == 'function'){
  %>on_<% if (method){ %><%= method %>_<%}%>process: <%- on_process.toString() %>,<%
} // end type check
} // end on_process
%>