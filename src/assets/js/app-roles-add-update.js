/**
 * Add new role Modal JS
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const selectAll = document.querySelector('#selectAll');
  const modelSelectors = document.querySelectorAll('.model-selector');
  const allPermissionCheckboxes = document.querySelectorAll('.permission-checkbox');

  // ✅ Verifica si todos los checkboxes están marcados
  const updateSelectAllStatus = () => {
    selectAll.checked = [...allPermissionCheckboxes].every(cb => cb.checked);
  };

  // ✅ Verifica si todos los permisos de un grupo están marcados
  const updateModelSelectorStatus = modelSlug => {
    const modelCheckbox = document.querySelector(`#checkAll_${modelSlug}`);
    const permissionCheckboxes = document.querySelectorAll(`.check-${modelSlug}`);
    modelCheckbox.checked = [...permissionCheckboxes].every(cb => cb.checked);
  };

  // ✅ Marcar o desmarcar todos los checkboxes
  selectAll?.addEventListener('change', e => {
    const checked = e.target.checked;
    document.querySelectorAll('.form-check-input:not(#selectAll)').forEach(cb => {
      cb.checked = checked;
    });
  });

  // ✅ Manejar cada grupo de permisos (model-selector)
  modelSelectors.forEach(modelCheckbox => {
    const modelSlug = modelCheckbox.id.replace('checkAll_', '');
    const permissionCheckboxes = document.querySelectorAll(`.check-${modelSlug}`);

    // → Marcar/desmarcar todos los permisos del grupo
    modelCheckbox.addEventListener('change', () => {
      permissionCheckboxes.forEach(cb => cb.checked = modelCheckbox.checked);
      updateSelectAllStatus();
    });

    // → Monitorear cambios individuales
    permissionCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        updateModelSelectorStatus(modelSlug);
        updateSelectAllStatus();
      });
    });

    // Estado inicial al cargar
    updateModelSelectorStatus(modelSlug);
  });

  updateSelectAllStatus(); // Estado inicial
});