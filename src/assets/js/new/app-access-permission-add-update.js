/**
 * App permissions list (jquery)
 */
$(function() {
    var dataTablePermisos = $('.datatables-permisos')
    var dt_permission

    // Lista permisos datatable
    if (dataTablePermisos.length) {
        dt_permission = dataTablePermisos.DataTable({

            columnDefs: [
                {
                    className: 'control',
                    orderable: false,
                    searchable: false,
                    responsivePriority: 2,
                    targets: 0,
                    render: function (data, type, full, meta) {
                        return '';
                    }
                },
                {
                    targets: 1,
                    searchable: false,
                },
                {
                    // Descripcion
                    targets: 2,
                },
                {
                    // Grupos
                    targets: 3,
                    orderable: false,
                },
                {
                    // remove ordering from Name
                    targets: 4,
                    orderable: false,
                },
                {
                    // Acciones
                    targets: -1,
                    searchable: false,
                    orderable: false,
                }
            ],
            order: [[1, 'asc']],
            dom:
                '<"row mx-1"' +
                '<"col-sm-12 col-md-3 mb-n5" l>' +
                '<"col-sm-12 col-md-9"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-md-end justify-content-center flex-wrap me-1"<"me-4"f>>>' +
                '>t' +
                '<"row mx-1"' +
                '<"col-sm-12 col-md-6"i>' +
                '<"col-sm-12 col-md-6"p>' +
                '>',
            language: {
                sLengthMenu: 'Show _MENU_',
                search: '',
                searchPlaceholder: 'Search Permissions',
                paginate: {
                next: '<i class="ri-arrow-right-s-line"></i>',
                previous: '<i class="ri-arrow-left-s-line"></i>'
                }
            },
            responsive: {
                details: {
                display: $.fn.dataTable.Responsive.display.modal({
                    header: function (row) {
                    var data = row.data();
                    return 'Details of ' + data['name'];
                    }
                }),
                type: 'column',
                renderer: function (api, rowIdx, columns) {
                    var data = $.map(columns, function (col, i) {
                    return col.title !== '' // ? Do not show row in modal popup if title is blank (for check box)
                        ? '<tr data-dt-row="' +
                            col.rowIndex +
                            '" data-dt-column="' +
                            col.columnIndex +
                            '">' +
                            '<td>' +
                            col.title +
                            ':' +
                            '</td> ' +
                            '<td>' +
                            col.data +
                            '</td>' +
                            '</tr>'
                        : '';
                    }).join('');

                    return data ? $('<table class="table"/><tbody />').append(data) : false;
                }
                }
            },
        })
    }
})