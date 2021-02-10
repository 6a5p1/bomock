class StyledWidget {
  constructor(fields = []) {
    this.fields = fields;
    this.el = document.createElement('div');
    this.render();
  }
  getPresetStyles() {
    return [
      {
        name: 'color',
        type: 'color'
      },
      {
        name: 'background_color'
      },
      {
        name: 'border_color'
      },
      {
        name: 'border_radius'
      },
      {
        name: 'font_family'
      },
      {
        name: 'font_size'
      },
      {
        name: 'font_weight'
      },
      {
        name: 'line_height'
      },
      {
        name: 'box_shadow'
      },
    ];
  }
  createStyle(override = {}) {
    const defaultValue = {
      property: null,
      value: ''
    };
    return {
      ...defaultValue,
      ...override
    };
  }
  createField(override = {}) {
    const defaultValue = {
      value: '',
      type: 'text',
      styles: []
    };
    return {
      ...defaultValue,
      ...override
    };
  }
  addStyle(index, event) {
    if (event) event.preventDefault();
    this.fields[index].styles.push(this.createStyle({is_new: true}));
    this.render();
  }
  removeStyle(index, styleIndex, event) {
    if (event) event.preventDefault();
    this.fields[index].styles.splice(styleIndex, 1);
    this.render();
  }
  toggleStyle(index, event) {
    if (event) event.preventDefault();
    this.fields[index].is_expanded = !this.fields[index].is_expanded;
    this.render();
  }
  addField(event) {
    if (event) event.preventDefault();
    this.fields.push(this.createField({is_new: true, is_expanded: true}));
    this.render();
  }
  getObject(str) {
    const arr = str.split('.');
    const key = arr.pop();
    const obj = arr.join('.');
    return eval(`this.${obj}`);
  }
  changeValueOf(event) {
    event.preventDefault();

    const str = event.currentTarget.name;
    const arr = str.split('.');
    const key = arr.pop();
    const obj = arr.join('.');
    const object = eval(`this.${obj}`);
    object[key] = event.currentTarget.value;
    this.updateConsole();
  }
  addListeners() {
    const events = {
      'click .style-add': (event) => { this.addStyle(event.currentTarget.dataset.index, event); },
      'click .style-remove': (event) => { this.removeStyle(event.currentTarget.dataset.index, event.currentTarget.dataset.styleIndex, event); },
      'input .style-value': this.changeValueOf,
      'input .style-property': this.changeValueOf,
      'blur .style-value': this.render,
      'blur .style-property': this.render,
      'click .style-edit': (event) => { this.toggleStyle(event.currentTarget.dataset.index, event); },
      'click .field-add': this.addField,
      'change .style-preset': (event) => {
        if (event.currentTarget.value === 'MANUAL') {
          const obj = this.getObject(event.currentTarget.name);
          const key = event.currentTarget.name.split('.').pop();
          obj[key] = '';
          obj.is_custom = true;
        } else {
          this.changeValueOf(event);
        }
        this.render(); 
      }
    };
    Object.keys(events).forEach((key) => {
      const a = key.split(/\s+/);
      const event = a[0];
      const target = a[1];
      const callback = events[key];
      this.el.querySelectorAll(target).forEach(el => {
        el.addEventListener(event, callback.bind(this));
      });
    });
  }
  updateConsole() {
    const cons = this.el.querySelector('.console');
    if (cons) cons.innerHTML = `<pre>${JSON.stringify(this.fields, null, 2)}</pre>`;
  }
  render() {
    setTimeout(() => {
      this.el.innerHTML = `
      <div class="bo-container">
        <div class="bo-row">
          <div class="bo-col">
            ${this.fields.map((field, index) => (
              `<div class="field">
                <h2>${field.value}
                  <button class="style-btn style-edit" data-index="${index}">${field.is_expanded ? 'collapse': 'edit'}</button>
                </h2>
                <div class="style-container ${!field.is_expanded ? 'hidden': ''}">
                  <div class="bo-row style-row">
                    <div class="bo-col bo-col-1-3 style-col">
                      <label for="name="fields[${index}].value"><strong>Content</strong></label>
                    </div>
                    <div class="bo-col style-col">
                      <input type="text" id="name="fields[${index}].value" name="fields[${index}].value" class="input style-value" value="${field.value}">
                    </div>
                  </div>
                  ${field.styles.map((style, styleIndex) => (
                    `<div class="bo-row style-row">
                      <div class="bo-col bo-col-1-3 style-col">
                        ${style.is_new ? 
                          style.is_custom ? `
                              <input name="fields[${index}].styles[${styleIndex}].property" type="text" class="input style-property" value="${style.property}">
                          ` : `
                            <select name="fields[${index}].styles[${styleIndex}].property" class="input style-preset">
                              <option value selected disable>Select a property</option>
                              ${this.getPresetStyles().map(preset => `
                                <option value="${preset.name}" ${style.property == preset.name ? 'selected':''}>${preset.text || preset.name}</option>
                              `).join('')}
                              <option value="MANUAL">MANUAL</option>
                            </select>
                          `
                        : `
                          <label for="fields[${index}].styles[${styleIndex}].value" title="${style.property}">${style.property}</label>
                        `}
                      </div>
                      <div class="bo-col style-col">
                        <input type="${
                          (this.getPresetStyles().filter(preset => preset.name == style.property)[0]||{}).type || 'text'
                        }" id="fields[${index}].styles[${styleIndex}].value" name="fields[${index}].styles[${styleIndex}].value" class="input style-value" value="${style.value}">
                      </div>
                      <div class="bo-col bo-col-1-12 style-col">
                        <button class="style-btn style-remove" data-index="${index}" data-style-index="${styleIndex}">-</button>
                      </div>
                    </div>`
                  )).join('')}
                  <div class="style-row">
                    <button class="style-btn style-add" data-index="${index}">+ add property</button>
                  </div>
                </div>
              </div>`
            )).join('')}
            <button class="style-btn field-add">+ add field</button>
          </div>
          <div class="bo-col">
            <div class="console"><pre>${JSON.stringify(this.fields, null, 2)}</pre></div>
          </div>
        </div>
      </div>
      `;
      this.addListeners();
    }, 0);
  }
}