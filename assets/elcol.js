// namespaces
var elcol = {};

// definitions
elcol.templates = {
  "elcol.icon": "<i class=\"icon\"></i>",
  "elcol.input": "<input type=\"\">",
  "elcol.label": "<label for=\"\"></label>",
  "elcol.textarea": "<textarea></textarea>",
  "elcol.table": "<table></table>",
  "elcol.row": "<tr></tr>",
  "elcol.cell": "<td></td>"
}


// register information in comproso namespace
comproso.register.namespace('elcol');
comproso.register.templates(elcol.templates);

