let cliente = {
     mesa: '',
     hora: '',
     pedido: [],
};

const categorias = {
     1: 'Comida',
     2: 'Bebidas',
     3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente(){
     const mesa = document.querySelector('#mesa').value;
     const hora = document.querySelector('#hora').value;

     // Revisar si hay campos vacios

     const camposVacios = [mesa, hora].some(campo => campo === '');

     if(camposVacios){
          if(!document.querySelector('.invalid-feedback')){
               const alerta = document.createElement('div');
               alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
               alerta.textContent = 'Todos los campos son obligatorios';
               document.querySelector('.modal-body form').appendChild(alerta);
               setTimeout(() => {
                    alerta.remove();
               }, 3000);
          }
          return;
     }

     // Asignar los datos del formulario a cliente 
      
     cliente = {...cliente,mesa,hora}
     
     // Ocultar Modal
     const modalFormulario = document.querySelector('#formulario');
     const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
     modalBootstrap.hide();

     // Mostrar las secciones
     mostrarSecciones();

     //Obtener platillos de la API de JSON-Server
     obtenerPlatillos();

}

function mostrarSecciones() {
     const seccionesOcultas = document.querySelectorAll('.d-none');
     seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
};

function obtenerPlatillos(){
     const url = 'http://localhost:4000/platillos';

     fetch(url)
          .then( respuesta => respuesta.json())
          .then( resultado => mostrarPlatillos(resultado))
          .catch(error => console.log(error));
}

function mostrarPlatillos(platillos){
     const contenido = document.querySelector('#platillos .contenido');

     platillos.forEach(platillo => {
          const {nombre, precio, categoria} = platillo
          const row = document.createElement('div');
          row.classList.add('row', 'py-3', 'boder-top');

          const divNombre = document.createElement('div');
          divNombre.classList.add('col-md-4');
          divNombre.textContent = nombre; 

          const divPrecio = document.createElement('div');
          divPrecio.classList.add('col-md-3', 'fw-bold');
          divPrecio.textContent = `$${precio}`;

          const divCategoria = document.createElement('div');
          divCategoria.classList.add('col-md-3');
          divCategoria.textContent = categorias[categoria];

          const inputCantidad = document.createElement('input');
          inputCantidad.type = 'number';
          inputCantidad.min = 0;
          inputCantidad.value = 0;
          inputCantidad.id = `producto-${platillo.id}`;
          inputCantidad.classList.add('form-control');
          inputCantidad.onchange = () => {
               const cantidad = Number(inputCantidad.value);
               agregarPlatillo({...platillo, cantidad});
          };


          const divAgregar = document.createElement('div');
          divAgregar.classList.add('col-md-2');

          divAgregar.appendChild(inputCantidad);


          row.appendChild(divNombre);
          row.appendChild(divPrecio);
          row.appendChild(divCategoria);
          row.appendChild(divAgregar);

          contenido.append(row);
     })
};

function agregarPlatillo(producto){
     let {pedido} = cliente;
     if(producto.cantidad > 0){
          // Comprueba si el elemento ya existe en el array
          if(pedido.some(articulo => articulo.id === producto.id )){
               // Ya existe, actualizar la cantidad
               const pedidoActualizado = pedido.map( articulo => {
                    if(articulo.id === producto.id){
                         articulo.cantidad = producto.cantidad;
                    }
                    return articulo;
               })
               cliente.pedido = [...pedidoActualizado];

          }else{
               // Si el articulo no existe, se agrega al array
               cliente.pedido = [...pedido, producto];
          }
     }else{
          const resultado = pedido.filter( articulo => articulo.id !== producto.id);
          cliente.pedido = [...resultado];
     };

     limpiarHTML();

     if(cliente.pedido.length){
          actualizarResumen();
     }else{
          mensajePedidoVacio();
     }

};


function actualizarResumen() {
     const contenido = document.querySelector('#resumen .contenido');

     const resumen = document.createElement('div');
     resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');
     resumen.innerHTML = `
          <h3 class="my-4 text-center">Platillos consumidos</h3>
          <p class="fw-bold">Mesa: <span class="fw-normal">${cliente.mesa}</span>
          <p class="fw-bold">Hora: <span class="fw-normal">${cliente.hora}</span>
     `;


     //Iterar sobre el array de pedidos
     const grupo = document.createElement('ul');
     grupo.classList.add('list-group');

     const {pedido} = cliente;
     pedido.forEach( articulo => {
          const {nombre, cantidad, precio, id} = articulo;

          const lista = document.createElement('li');
          lista.classList.add('list-group-item');
          lista.innerHTML = `
               <h4 class="my-4">${nombre}</h4>
               <p class="fw-bold">Cantidad: <span class="fw-normal">${cantidad}</span></p>
               <p class="fw-bold">Precio: <span class="fw-normal">$${precio}</span></p>
               <p class="fw-bold">Subtotal: <span class="fw-normal">$${precio*cantidad}</span></p>
          `;

          const btnEliminar = document.createElement('button');
          btnEliminar.classList.add('btn', 'btn-danger');
          btnEliminar.textContent = 'Eliminar del pedido';
          btnEliminar.onclick = () => {
               eliminarProducto(id);
          }

          lista.appendChild(btnEliminar);
          grupo.appendChild(lista);
     })

     // Agregando al contenido
     resumen.appendChild(grupo);
     contenido.appendChild(resumen);

     // Mostrar formulario de propinas;

     formularioPropinas();
}

function limpiarHTML(){
     while(document.querySelector('#resumen .contenido').firstChild){
          document.querySelector('#resumen .contenido').removeChild(document.querySelector('#resumen .contenido').firstChild);
     }
}

function eliminarProducto(id){
     const { pedido } = cliente;
     const resultado = pedido.filter( articulo => articulo.id !== id);
     cliente.pedido = [...resultado];
     
     limpiarHTML();

     if(cliente.pedido.length){
          actualizarResumen();
     }else{
          mensajePedidoVacio();
     }

     // El producto es elimino, regresar el input a 0
     const productoEliminado = document.querySelector(`#producto-${id}`);
     productoEliminado.value = 0;
};

function mensajePedidoVacio(){
     const contenido = document.querySelector('#resumen .contenido');

     const texto = document.createElement('p');
     texto.classList.add('text-center');
     texto.textContent = 'Añade los elementos del pedido';

     contenido.appendChild(texto);
}

function formularioPropinas(){
     const contenido = document.querySelector('#resumen .contenido');

     const formulario = document.createElement('div');
     formulario.classList.add('col-md-6', 'formulario');

     const divFormulario = document.createElement('div');
     divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow')
     divFormulario.innerHTML = `
          <h3 class="my-4 text-center">Propina</h3>
     `;

     // Radio button 10%
     const radio10 = document.createElement('input');
     radio10.type = 'radio';
     radio10.name = 'propina';
     radio10.value = '10';
     radio10.classList.add('form-check-input');
     radio10.onclick = calcularPropina;

     const radio10Label = document.createElement('label');
     radio10Label.textContent = '10%';
     radio10Label.classList.add('form-check-label');

     const radio10Div = document.createElement('div');
     radio10Div.classList.add('form-check');

     radio10Div.appendChild(radio10);
     radio10Div.appendChild(radio10Label);

     // Radio buttono 25%
     const radio25 = document.createElement('input');
     radio25.type = 'radio';
     radio25.name = 'propina';
     radio25.value = '25';
     radio25.classList.add('form-check-input');
     radio25.onclick = calcularPropina;

     const radio25Label = document.createElement('label');
     radio25Label.textContent = '25%';
     radio25Label.classList.add('form-check-label');

     const radio25Div = document.createElement('div');
     radio25Div.classList.add('form-check');

     radio25Div.appendChild(radio25);
     radio25Div.appendChild(radio25Label);

     // Radio button 50%
     const radio50 = document.createElement('input');
     radio50.type = 'radio';
     radio50.name = 'propina';
     radio50.value = '50';
     radio50.classList.add('form-check-input');
     radio50.onclick = calcularPropina;

     const radio50Label = document.createElement('label');
     radio50Label.textContent = '50%';
     radio50Label.classList.add('form-check-label');

     const radio50Div = document.createElement('div');
     radio50Div.classList.add('form-check');

     radio50Div.appendChild(radio50);
     radio50Div.appendChild(radio50Label);

     divFormulario.appendChild(radio10Div);
     divFormulario.appendChild(radio25Div);
     divFormulario.appendChild(radio50Div);

     formulario.appendChild(divFormulario);
     contenido.appendChild(formulario);
};

function calcularPropina(e){
     const { pedido } = cliente;
     let subtotal = 0

     // Calcular subtotal
     pedido.forEach( articulo => {
          subtotal += (articulo.precio * articulo.cantidad);
     });

     // Leer la propina %
     const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

     // Calcular la propina
     const propina = ((subtotal * Number(propinaSeleccionada)) / 100);

     const total = subtotal + propina;

     mostrarTotalHTML(subtotal, propina, total);
};

function mostrarTotalHTML(subtotal, propina, total){
     const divTotales = document.createElement('div');
     divTotales.classList.add('total-pagar', 'my-5');
     divTotales.innerHTML = `
          <p class="fs-3 fw-bold mt-5">Subtotal consumo: <span class="fw-normal">$${subtotal}</span></p>
          <p class="fs-3 fw-bold mt-5">Propina: <span class="fw-normal">$${propina}</span></p>
          <p class="fs-3 fw-bold mt-5">Total a pagar: <span class="fw-normal">$${total}</span></p>
     `;

     const totalPagarDiv = document.querySelector('.total-pagar');

     if(totalPagarDiv){
          totalPagarDiv.remove();
     }

     const formulario = document.querySelector('.formulario > div');
     formulario.appendChild(divTotales);
}