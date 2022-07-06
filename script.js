function viewer(container, data) {
      const names = Object.getOwnPropertyNames(data);
      const symbs = Object.getOwnPropertySymbols(data);
      const proto = Object.getPrototypeOf(data);

      const keys = names.sort().concat(symbs);
      const printData = [];

      keys.forEach((key) => {
            const descriptor = Object.getOwnPropertyDescriptor(data, key);
            let { enumerable, value, get, set } = descriptor;

            // some properties may not accessible or deprecated
            // so try to access it directly (may can throw an error).
            if (value == undefined) {
                  try { value = data[key] } 
                  catch (e) { value = e.message }
            }

            if (typeof key == "symbol") {
                  key = key.toString();
            }

            printData.push({ 
                  key: key,
                  value: value,
                  enumerable: enumerable
            });

            if (get) printData.push({ 
                  key: "get " + key, 
                  value: get,
                  enumerable: enumerable
            });

            if (set) printData.push({ 
                  key: "set " + key, 
                  value: set,
                  enumerable: enumerable
            });
      });

      if (proto) printData.push({
            key: "[[Prototype]]", 
            value: proto,
            enumerable: false
      });

      printer(container, printData);
}

function printer(container, printData) {
      // to hold enumerable element
      const isenum = [];
      // to hold non enumerable element
      const noenum = [];

      const fragment = document.createDocumentFragment();

      printData.forEach((data) => {
            const { key, value, enumerable } = data;
            const label = formatter(key, value, enumerable);

            if (isPrimitive(value)) {
                  const child = html("div", {
                        className: "tree-child",
                        innerHTML: label,
                  });

                  return enumerable 
                        ? isenum.push(child) 
                        : noenum.push(child);
            }

            // generate tree if properties is not primitive.

            const head = html("summary", {
                  className: "tree-head",
                  innerHTML: label,
            });

            const body = html("div", {
                  className: "tree-body",
            });

            const root = html("details", {
                  className: "tree",
            }, head, body);

            let visited = false;

            // render the childs lazily when 
            // the tree is opened for the first time. 
            // this will create an endless tree.
            head.onclick = () => {
                  if (visited) return;

                  viewer(body, value);
                  visited = true;
            };

            enumerable 
                  ? isenum.push(root) 
                  : noenum.push(root);
      });

      fragment.append(...isenum, ...noenum);
      container.append(fragment);
}

function formatter(key, value, enumerable) {
      let type = typeof value;

      if (type == "string") {
            value = `"${value}"`;
      }

      if (type == "function") {
            value = `<span>ƒ</span> ${value.name}()`;
      }

      if (type == "object" && value != null) {
            Array.isArray(value) ? (value = "[...]") : (value = "{...}");
      }

      return `
            <span class="label-key ${enumerable ? "" : "noenum"}">${key}</span>: 
            <span class="label-value ${type}">${value}</span>
      `;
}

function isPrimitive(data) {
      return (
            typeof data != "object" && 
            typeof data != "function"
      ) || data == null;
}

// helper to create html element
function html(name, props, ...childs) {
      const elem = document.createElement(name);

      if (props) {
            for (const key in props) {
                  elem[key] = props[key];
            }
      }

      if (childs) {
            elem.append(...childs);
      }

      return elem;
}

// test drive 🚀
viewer(document.body, window);
