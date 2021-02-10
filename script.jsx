function createElement(tagName, attrs = {}, ...children) {
  if (tagName === 'fragment') return children;
  const elem = document.createElement(tagName);
  for (let attr in attrs) {
    elem.setAttribute(attr, attrs[attr]);
  }
  for (const child of children) {
    if (Array.isArray(child)) elem.append(...child);
    else elem.append(child);
  }
  return elem;
}

class StyledWidget {
  constructor(fields = []) {
    this.fields = fields;
    this.el = document.createElement('div');
    this.update();
  }
  getPresetStyles() {
    return [
      {
        name: 'color',
        type: 'color'
      },
      {
        name: 'background_color',
        type: 'color'
      },
      {
        name: 'border_color',
        type: 'color'
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
    this.update();
  }
  removeStyle(index, styleIndex, event) {
    if (event) event.preventDefault();
    this.fields[index].styles.splice(styleIndex, 1);
    this.update();
  }
  toggleStyle(index, event) {
    if (event) event.preventDefault();
    this.fields[index].is_expanded = !this.fields[index].is_expanded;
    this.update();
  }
  addField(event) {
    if (event) event.preventDefault();
    this.fields.push(this.createField({is_new: true, is_expanded: true}));
    this.update();
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
    const key = str.split('.').pop();
    const object = this.getObject(str);
    object[key] = event.currentTarget.value;
    this.updateConsole();
  }
  addListeners() {
    const events = {
      'click .style-add': (event) => { this.addStyle(event.currentTarget.dataset.index, event); },
      'click .style-remove': (event) => { this.removeStyle(event.currentTarget.dataset.index, event.currentTarget.dataset.styleIndex, event); },
      'input .style-value': this.changeValueOf,
      'input .style-property': this.changeValueOf,
      // 'change .style-value': this.update,
      // 'change .style-property': this.update,
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
        this.update(); 
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
    // return this.update();
    const cons = this.el.querySelector('.console');
    if (cons) cons.innerHTML = `<pre>${JSON.stringify(this.fields, null, 2)}</pre>`;
  }
  update() {
    setTimeout(() => {
      this.el.innerHTML = '';
      this.el.appendChild(this.render());
      this.addListeners();
    }, 100);
  }
  render() {
    return (
      <div class="bo-container">
        <div class="bo-row">
          <div class="bo-col">
            {this.fields.map((field, index) => (
              <div class="field">
                <h2>
                  {field.value}
                  <button class="style-btn style-edit" data-index={index}>{field.is_expanded ? 'collapse': 'edit'}</button>
                </h2>
                <div class={`style-container ${!field.is_expanded ? 'hidden': ''}`}>
                  <div class="bo-row style-row">
                    <div class="bo-col bo-col-1-3 style-col">
                      <label for={`fields[${index}].value`}><strong>Content</strong></label>
                    </div>
                    <div class="bo-col style-col">
                      <input type="text" id={`fields[${index}].value`} name={`fields[${index}].value`} class="input style-value" value={field.value} />
                    </div>
                  </div>
                  {field.styles.map((style, styleIndex) => (
                    <div class="bo-row style-row">
                      <div class="bo-col bo-col-1-3 style-col">
                        {style.is_new ? (
                          <span>
                            {style.is_custom ? (
                              <input name={`fields[${index}].styles[${styleIndex}].property`} type="text" class="input style-property" value={style.property} />
                            ) : (
                              <select name={`fields[${index}].styles[${styleIndex}].property`} class="input style-preset">
                                <option value="" selected={true} disabled={true}>Select a property</option>
                                {this.getPresetStyles().map((preset) => (
                                  <option value={preset.name} selected={style.property == preset.name}>
                                    {preset.text || preset.name}
                                  </option>
                                ))}
                                <option value="MANUAL">MANUAL</option>
                              </select>
                            )}
                          </span>
                        ) : (
                          <label for={`fields[${index}].styles[${styleIndex}].value`} title={style.property}>{style.property}</label>
                        )}
                      </div>
                      <div class="bo-col style-col">
                        <input
                          type={`${(this.getPresetStyles().filter(preset => preset.name == style.property)[0]||{}).type || 'text'}`}
                          id={`fields[${index}].styles[${styleIndex}].value`}
                          name={`fields[${index}].styles[${styleIndex}].value`}
                          class="input style-value" value={style.value} />
                      </div>
                      <div class="bo-col bo-col-1-12 style-col">
                        <button class="style-btn style-remove" data-index={index} data-style-index={styleIndex}>-</button>
                      </div>
                    </div>
                  ))}
                  <div class="style-row">
                    <button class="style-btn style-add" data-index={index}>+ add property</button>
                  </div>
                </div>
              </div>
            ))}
            <button class="style-btn field-add">+ add field</button>
          </div>
          <div class="bo-col">
            <div class="console"><pre>{JSON.stringify(this.fields, null, 2)}</pre></div>
          </div>
        </div>
      </div>
    );
  }
}