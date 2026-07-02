class PaintControl {
  constructor(el, options) {
    this._el = el;
    this._widgetInstance = el.widgetInstance;
    this._options = options;
    this._inputElId = this._options.id;

    // If there is already a control with this ID, remove it before adding a new one
    const map = this._widgetInstance.getMap();
    const existingControl = map._controls.find(
      (ctrl) => ctrl instanceof PaintControl && ctrl._inputElId === this._inputElId,
    );
    if (existingControl) {
      map.removeControl(existingControl);
    }
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl toro-paint-control';
    if (this._options.label) {
      const labelEl = document.createElement('div');
      labelEl.className = 'paint-control-label';
      labelEl.textContent = this._options.label;
      this._container.appendChild(labelEl);
    }
    this._container.appendChild(this._renderInput());
    this._syncControlRegistry();

    this._updateSelectedOption(this.getDefaultValue());
    return this._container;
  }

  onRemove() {
    if (this._container) {
      this._container.remove();
    }

    const currentControls = this._widgetInstance.getControls() || [];
    this._widgetInstance.setControls(
      currentControls.filter(
        (controlMeta) =>
          !(controlMeta && controlMeta.type === 'paint' && controlMeta.id === this._inputElId),
      ),
    );

    this._map = undefined;
  }

  _syncControlRegistry() {
    const currentControls = this._widgetInstance.getControls() || [];
    const nextControls = currentControls.filter(
      (controlMeta) =>
        !(controlMeta && controlMeta.type === 'paint' && controlMeta.id === this._inputElId),
    );

    nextControls.push({
      id: this._inputElId,
      panelId: this._options.panelId || null,
      groupId: this._options.groupId || null,
      type: 'paint',
      control: this,
    });

    this._widgetInstance.setControls(nextControls);
  }

  getDefaultValue() {
    let defaultValue = this._options.default;
    if (!defaultValue || (defaultValue === undefined && this._options.optionsList?.length > 0)) {
      defaultValue = this._options.optionsList[0].value || this._options.optionsList[0].id;
    }
    return defaultValue;
  }

  _renderInput() {
    let inputElement = document.createElement('div');
    inputElement.id = `paint-control-container-${this._widgetInstance.getId()}`;
    inputElement.className = 'paint-control-input';

    let defaultValue = this.getDefaultValue();

    if (this?._options?.inputType === 'radio') {
      inputElement.classList.add('paint-control-radio');
      let radioGroupName = `paint-control-radio-${this._widgetInstance.getId()}`;
      this._options.optionsList?.forEach((option) => {
        let optionId = option.id || option.value;
        let radioId = `paint-control-radio-${optionId}-${this._widgetInstance.getId()}`;
        const inputContainer = document.createElement('div');
        inputContainer.className = 'paint-control-radio-option';
        let radioElement = document.createElement('input');
        radioElement.type = 'radio';
        radioElement.name = radioGroupName;
        radioElement.id = radioId;
        radioElement.value = optionId;

        if (optionId === defaultValue) {
          radioElement.checked = true;
        }
        radioElement.addEventListener('change', (event) => {
          if (event.target.checked) {
            this._updateSelectedOption(event.target.value);
          }
        });

        let labelElement = document.createElement('label');
        labelElement.htmlFor = radioId;
        labelElement.textContent = option.label || optionId;

        inputContainer.appendChild(radioElement);
        inputContainer.appendChild(labelElement);
        inputElement.appendChild(inputContainer);
      });
    } else {
      // Select input
      inputElement.classList.add('paint-control-select');
      let selectElement = document.createElement('select');
      selectElement.id = this._inputElId;
      this._options.optionsList?.forEach((option) => {
        let optionElement = document.createElement('option');
        const optValue = option.value || option.id;
        optionElement.value = optValue;
        optionElement.textContent = option.label;
        if (optValue === defaultValue) {
          optionElement.selected = true;
        }
        selectElement.appendChild(optionElement);
      });
      selectElement.addEventListener('change', (event) => {
        this._updateSelectedOption(event.target.value);
      });
      inputElement.appendChild(selectElement);
    }
    return inputElement;
  }

  _updateSelectedOption(inputValue) {
    // If the target layer has a cluster open (spiderfying), close it first
    closeSpiderfy(this._el);
    // Find the selected paint option based on the input value
    let selectedOption = this._options.optionsList.find(
      (option) => option.value === inputValue || option.id === inputValue,
    );
    if (!selectedOption) {
      const firstOption = this._options.optionsList?.[0];
      if (firstOption) {
        selectedOption = firstOption;
      }
    }

    updateShiny(this._inputElId, inputValue);

    // Update the map layer's paint properties using the selected option
    const layerId = this._options.layerId;
    const paintProperties = selectedOption.paint;
    const layoutProperties = selectedOption.layout;
    const legendProperties = selectedOption.legend;
    if (paintProperties) {
      Object.entries(paintProperties)?.forEach(([property, value]) => {
        this._map.setPaintProperty(layerId, property, value);
      });
    }
    if (layoutProperties) {
      Object.entries(layoutProperties)?.forEach(([property, value]) => {
        this._map.setLayoutProperty(layerId, property, value);
      });
    }
    if (legendProperties && legendProperties.html) {
      const allLegendIds = this._options.optionsList?.map(
        (item) => item.legend?.id || `${item.id}_legend`,
      );
      allLegendIds?.forEach((legendId) => removeControl(this._widgetInstance, legendId));
      addCustomControl(
        this._map,
        legendProperties.id || `${selectedOption.id}_legend`,
        legendProperties.html,
        legendProperties.position,
      );
    } else if (legendProperties) {
      addLegendForLayer(this._widgetInstance, layerId, legendProperties || {});
    }
  }
}

function addPaintControl(el, options) {
  // Enforce unique paint control IDs by replacing an existing control with the same ID.
  removePaintControl(el, options.id);

  const control = new PaintControl(el, options);

  el.mapInstance.addControl(control, options.position);
}

function removePaintControl(el, controlId) {
  const widgetInstance = el.widgetInstance;
  const map = widgetInstance.getMap();

  const trackedControls = widgetInstance.getControls() || [];

  const controlToRemove = map._controls.find(
    (ctrl) => ctrl instanceof PaintControl && ctrl._inputElId === controlId,
  );
  if (controlToRemove) {
    map.removeControl(controlToRemove);
    return;
  }

  widgetInstance.setControls(
    trackedControls.filter(
      (controlMeta) =>
        !(controlMeta && controlMeta.type === 'paint' && controlMeta.id === controlId),
    ),
  );
}

/**
 * Add Shiny message handlers for paint controls.
 */
function addPaintControlListeners() {
  Shiny.addCustomMessageHandler('addPaintControl', function (message) {
    withMapInstance(message.id, function (el) {
      addPaintControl(el, message.options);
    });
  });

  Shiny.addCustomMessageHandler('removePaintControl', function (message) {
    withMapInstance(message.id, function (el) {
      removePaintControl(el, message.controlId);
    });
  });
}
