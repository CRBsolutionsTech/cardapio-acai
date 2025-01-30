const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warning");

let cart = [];

// Função para salvar o carrinho no localStorage
function saveCartToLocalStorage() {
    const cartData = {
        cart,
        timestamp: Date.now()
    };
    localStorage.setItem("cart", JSON.stringify(cartData));
}

// Função para carregar o carrinho do localStorage
function loadCartFromLocalStorage() {
    const cartData = JSON.parse(localStorage.getItem("cart"));
    if (cartData && (Date.now() - cartData.timestamp) < 60 * 60 * 1000) {
        cart = cartData.cart;
    } else {
        cart = [];
        localStorage.removeItem("cart");
    }
}

// Função para atualizar o carrinho e salvar no localStorage
function updateCart() {
    updateCartModal();
    saveCartToLocalStorage();
}

// Função para atualizar a interface com o estado de seleção de complementos
function updateComplementosState(productName) {
    const complementCheckboxes = document.querySelectorAll(`.complement-checkbox[data-product-name="${productName}"]`);
    const selectedComplementos = document.querySelectorAll(`.complement-checkbox[data-product-name="${productName}"]:checked`);
    const selectedCount = selectedComplementos.length;

    // Se atingiu o limite de 3 complementos, desabilitar os checkboxes restantes
    if (selectedCount >= 3) {
        complementCheckboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                checkbox.disabled = true;  // Desabilita checkboxes não selecionados
            }
        });
    } else {
        // Caso contrário, habilita todos os checkboxes novamente
        complementCheckboxes.forEach(checkbox => {
            checkbox.disabled = false;
        });
    }
}

// Adicionar evento de 'change' para monitorar mudanças nos checkboxes para cada produto
document.querySelectorAll('.complement-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const productName = event.target.getAttribute('data-product-name');
        updateComplementosState(productName);
    });
});

// Inicializa o estado dos checkboxes quando a página carrega
document.querySelectorAll('.complement-checkbox').forEach(checkbox => {
    const productName = checkbox.getAttribute('data-product-name');
    updateComplementosState(productName);
});

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function () {
    updateCartModal();
    cartModal.style.display = "flex";
});

// Fechar o modal quando clicar fora
cartModal.addEventListener("click", function (event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

// Botão Fechar
closeModalBtn.addEventListener("click", function () {
    cartModal.style.display = "none";
});

// Adicionar item no carrinho
menu.addEventListener("click", function (event) {
    let parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));
        
        // Obter os complementos selecionados para este item
        const complementos = getSelectedComplementos(name);
        addToCart(name, price, complementos);
    }
});

// Função para Adicionar no carrinho
function addToCart(name, price, complementos = []) {
    const existeItem = cart.find(item => item.name === name);

    if (existeItem) {
        existeItem.quantity += 1;
        existeItem.complementos = complementos;  // Atualizar complementos
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
            complementos
        });
    }

    // Alerta de item adicionado ao carrinho
    Toastify({
        text: "ITEM ADICIONADO AO CARRINHO",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "#00C040",
        },
    }).showToast();

    updateCart(); // Atualiza a interface e o localStorage
}

// Atualiza o carrinho no modal (com complementos)
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        // Exibe os dados no modal, com os complementos incluídos
        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p>Qtde: ${item.quantity}</p>
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>

                <button class="remove-from-cart-btn cursor-pointer" data-name="${item.name}">
                    Remover
                </button>
            </div>

            <div>
                <!-- Exibir complementos no modal -->
                ${item.complementos.length > 0 ? `<p>Complementos: ${item.complementos.join(", ")}</p>` : ""}
            </div>
        `;

        total += item.price * item.quantity;

        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerHTML = cart.length;
}

// Função para remover item do carrinho
cartItemsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }

        updateCart(); // Atualiza a interface e o localStorage
    }
}

// Função para capturar os complementos selecionados no HTML para cada produto
function getSelectedComplementos(productName) {
    const complementos = [];
    const complementosInputs = document.querySelectorAll(`input[data-product-name="${productName}"]:checked`);
    complementosInputs.forEach(input => complementos.push(input.value));
    return complementos;  // Retorna os complementos selecionados
}

// Finalizar Pedido
checkoutBtn.addEventListener("click", function () {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "OPS... O RESTAURANTE ESTÁ FECHADO",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#ef4444",
            },
        }).showToast();

        return;
    }

    if (cart.length === 0) return;

    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    // Enviar o pedido para a API do WhatsApp
    const totalPrice = cart.reduce((total, item) => total + (item.quantity * item.price), 0);

    const cartItems = cart.map((item) => {
        let complementosMessage = "";
        if (item.complementos.length > 0) {
            complementosMessage = ` Complementos: ${item.complementos.join(", ")}`;
        }

        return (
            ` 
        Pedido: ${item.name} 
        Quantidade: (${item.quantity}) 
        Preço: R$${item.price}
        Total: R$${item.quantity * item.price}
        ${complementosMessage}
         `
        );
    }).join(" "); // Substituir quebras de linha por %0A

    const address = encodeURIComponent(addressInput.value); // Codificar o endereço

    const message = encodeURIComponent(cartItems); // Codificar os itens do carrinho
    const phone = "5511991941575"; // Número de telefone (11) 99194-1575

    const totalMessage = `%0AValor Total: *R$ ${totalPrice.toFixed(2)}*%0A`; // Formatando o valor total

    const paymentMethod = document.getElementById("payment-method").value; // Forma de pagamento
    const paymentMessage = `*Forma de Pagamento:* (${paymentMethod})%0A`;

    const deliveryMessage = `%0A(Estimativa de entrega: *entre 30~40 minutos*)`; // Estimativa de Entrega
    const deliveryFeeMessage = `%0A*Delivery* (taxa de entrega: *R$ 5,00*)`; // Taxa de Entrega

    // Abrir o WhatsApp com a mensagem formatada
    window.open(`https://wa.me/${phone}?text=${message}%0A${totalMessage}%0A${paymentMessage}${deliveryFeeMessage}%0A*Endereço:* ${address}%0A${deliveryMessage}`, "_blank");

    cart = [];
    localStorage.removeItem("cart"); // Limpar o cache do carrinho
    updateCartModal();

    // Limpar os complementos no HTML
    const complementosInputs = document.querySelectorAll("input[type='checkbox']");
    complementosInputs.forEach(input => {
        input.checked = false; // Desmarcar todos os complementos
    });

    // Limpar o campo de endereço
    addressInput.value = "";
    addressInput.classList.remove("border-red-500"); // Remover a classe de erro (se houver)
    addressWarn.classList.add("hidden"); // Esconder a mensagem de alerta

    // Desbloquear os checkboxes após o envio do pedido
    document.querySelectorAll('.complement-checkbox').forEach(checkbox => {
        const productName = checkbox.getAttribute('data-product-name');
        // Reabilitar os checkboxes de complementos
        checkbox.disabled = false;
        // Atualiza o estado dos complementos para aquele produto
        updateComplementosState(productName);
    });
});

// Verificar se está dentro do horário de funcionamento
function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 8 && hora < 23; // Restaurante aberto entre 8h e 22h
}

// Atualiza a exibição do horário de funcionamento
const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600");
} else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
}

// Carregar o carrinho do localStorage ao iniciar a página
loadCartFromLocalStorage();
