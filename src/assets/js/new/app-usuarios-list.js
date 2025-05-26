/**
 * Page User List
 */

'use strict';

// Datatable (jquery)
$(function () {

  let borderColor, bodyBg, headingColor;

  if (isDarkStyle) {
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }

  // Variable declaration for table
  var dt_user_table = $('.datatables-usuarios')

  // Users datatable
  if (dt_user_table.length) {
    var dt_user = dt_user_table.DataTable({
      columnDefs: [
        
        {
          // Avatar - Nombre - Username
          targets: 0,
        },
        {
          // User email
          targets: 1,
        },
        {
          // User Role
          targets: 2,
        },
        {
          // Estado
          targets: 3,
        },
        {
          // Staff
          targets: 4,
        },
        {
          // Acciones
          targets: 5,
        },
        
      ],
      order: [[2, 'desc']],
      dom:
        '<"row mx-1"' +
        '<"col-md-2 d-flex align-items-center justify-content-md-start justify-content-center ps-4"<"dt-action-buttons mt-4 mt-md-0">>' +
        '<"col-md-10"<"d-flex align-items-center justify-content-md-end justify-content-center"<"me-4"f><"add-new">>>' +
        '>t' +
        '<"row mx-1"' +
        '<"col-sm-12 col-md-6"i>' +
        '<"col-sm-12 col-md-6"p>' +
        '>',
      language: {
        sLengthMenu: 'Show _MENU_',
        search: '',
        searchPlaceholder: 'Search User',
        paginate: {
          next: '<i class="ri-arrow-right-s-line"></i>',
          previous: '<i class="ri-arrow-left-s-line"></i>'
        }
      },
    });
  }
});