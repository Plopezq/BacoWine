const template = document.createElement('template');
template.innerHTML = `
  <link href="/static/stylesheets/bootstrap.min.css" rel="stylesheet" media="screen">
  <link rel='stylesheet' href='/static/stylesheets/style.css' />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css">
  <div class="input-group">
    <input type="text" class="form-control" id="nameVariedad">
    <button id="addVariedad" class="btn btn-info" type="button"><i class="bi bi-plus-circle"></i></button>
  </div>
  <div id="containerVariedad" class="pe-5"></div>
`;

class Variedad extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'variedad';
    input.id = 'variedad';
    input.value = '{}';
    this.appendChild(input);

    this.updateInputVariedad = this.updateInputVariedad.bind(this);
    this.clickAddVariant = this.clickAddVariant.bind(this);
    this.sumHundred = this.sumHundred.bind(this);
  }

  calculateRemaining() {
    const inputs = this.shadowRoot.querySelectorAll('#containerVariedad input');
    let sum = 100;
    inputs.forEach((inp) => { sum -= inp.value; });
    return sum;
  }

  updateInputVariedad() {
    const inputs = this.shadowRoot.querySelectorAll('#containerVariedad input');
    const start = inputs.length > 0 ? inputs[0] : {};
    const red = [...inputs].reduce((obj, item) => ({
      ...obj,
      [item.previousElementSibling.textContent]: item.value,
    }), start);
    this.querySelector('#variedad').value = JSON.stringify(red);
  }

  sumHundred() {
    const remain = this.calculateRemaining();
    const inputs = [...this.shadowRoot.querySelectorAll('#containerVariedad input')];
    const other = inputs.filter((val) => val.previousElementSibling.textContent === 'Otros');
    const rest = inputs.filter((val) => val.previousElementSibling.textContent !== 'Otros');
    let ret = 0;

    if (rest.length < 1 && other.length !== 1 && remain > 0) {
      this.shadowRoot.querySelector('#containerVariedad').append(this.createVariedad('Otros', remain));
    } if (rest.length >= 1 && other.length !== 1) {
      rest[rest.length - 1].valueAsNumber += remain;
    } else if (other.length === 1) {
      other[0].valueAsNumber += remain;
      if (other[0].valueAsNumber <= 0) {
        ret = other[0].valueAsNumber;
        other[0].parentElement.remove();
      }
    } else if (remain <= 0) {
      ret = remain;
    }
    return ret;
  }

  createVariedad(name, remaining) {
    const d = document.createElement('div');
    const s = document.createElement('span');
    const i = document.createElement('input');
    const b = document.createElement('button');

    s.innerText = name;
    s.classList.add('input-group-text');
    i.type = 'number';
    i.min = 0;
    i.max = 100;
    i.classList.add('form-control');
    i.valueAsNumber = remaining;
    i.onchange = () => {
      if (i.valueAsNumber < 0 || i.valueAsNumber >= 100
          || Number.isNaN(i.valueAsNumber)) {
        i.valueAsNumber = 0;
      }
      const remain = this.calculateRemaining();
      if (i.valueAsNumber === 0) {
        i.valueAsNumber = remain;
      }
      const ret = this.sumHundred();
      if (ret !== 0) i.valueAsNumber += ret;
      this.updateInputVariedad();
    };
    b.type = 'button';
    b.classList.add('btn', 'btn-warning');
    b.innerHTML = '<i class="bi bi-x-circle-fill"></i>';
    b.onclick = () => {
      d.remove();
      this.sumHundred();
      this.updateInputVariedad();
    };

    d.classList.add('input-group', 'pt-1');
    d.append(s, ' ', i, ' ', b);
    return d;
  }

  clickAddVariant() {
    const container = this.shadowRoot.querySelector('#containerVariedad');
    const addInput = this.shadowRoot.querySelector('#nameVariedad');
    const inputs = [...container.querySelectorAll('input')];
    const inp = inputs.length - 1;

    addInput.value = addInput.value.trim();
    const oth = inputs.filter((val) => val.previousElementSibling.textContent === addInput.value);

    let remaining = this.calculateRemaining();
    if (remaining <= 0 && addInput.value.trim() !== '' && oth.length === 0 && inp !== -1 && inputs[inp].value / 2 > 0.009) {
      inputs[inp].valueAsNumber /= 2;
      remaining = inputs[inp].valueAsNumber;
    } else {
      addInput.focus();
      addInput.click();
    }
    if (remaining !== 0) {
      if (addInput.value.trim() !== '' && oth.length === 0) {
        container.prepend(this.createVariedad(addInput.value, remaining));
        this.updateInputVariedad();
      }
      addInput.value = '';
      addInput.focus();
      addInput.click();
    }
  }

  static get observedAttributes() {
    return ['value'];
  }

  get value() {
    return this.getAttribute('value');
  }

  connectedCallback() {
    this.shadowRoot.querySelector('#addVariedad').addEventListener('click', this.clickAddVariant);

    if (!this.hasAttribute('value')) {
      this.setAttribute('value', '{}');
    } else {
      document.querySelector('#variedad').value = this.value;
    }

    const container = this.shadowRoot.querySelector('#containerVariedad');
    const variedad = JSON.parse(this.value);
    Object.keys(variedad).forEach((key) => {
      container.append(this.createVariedad(key.trim(), variedad[key]));
    });
    this.sumHundred();
  }
}

window.customElements.define('add-variant', Variedad);
