<%
if (on_input) {
 if (on_input === true ){
%>on_<% if (method){ %><%= method %>_<%}%>input: function (rs){var self = this;self.on_process(rs,rs.req_props);},<%
  } else if (typeof(on_input) == 'string'){ %>on_<% if (method){ %><%= method %>_<%}%>input: function (rs){<%- on_input %>},<%
  } else if (typeof(on_input) == 'function'){
  %>on_<% if (method){ %><%= method %>_<%}%>input: <%- on_input.toString() %>,<%
} // end type check
} // end on_input
%>