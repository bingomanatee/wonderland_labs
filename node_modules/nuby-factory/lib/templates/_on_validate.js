<%
if (on_validate) {
 if (on_validate === true ){
%>on_<% if (method){ %><%= method %>_<%}%>validate: function (rs){var self = this;this.on_input(rs);},<%
  } else if (typeof(on_validate) == 'string'){ %>on_<% if (method){ %><%= method %>_<%}%>validate: function (rs){<%- on_validate %>},<%
  } else if (typeof(on_validate) == 'function'){
  %>on_<% if (method){ %><%= method %>_<%}%>validate: <%- on_validate.toString() %>,<%
} // end type check
} // end on_validate
%>