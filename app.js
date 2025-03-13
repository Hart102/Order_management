document.addEventListener("DOMContentLoaded", async () => {
    const filterStatus = document.getElementById("filter");
    const sortString = document.getElementById("sort");
    const orderTable = document.getElementById("order-table");

    let orders = [];
    let visibleOrders = 10;
    let isFetching = false;

    // FETCH ORDERS FROM JSON FILE
    const fetchOrders = async () => {
        try {
            const response = await fetch("./orders.json");
            orders = await response.json();
            renderOrders();
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const renderOrders = () => {
        const filter = filterStatus.value;
        const sort = sortString.value;

        // FILTER ORDERS BY STATUS
        const filteredOrders = orders.filter(order => filter === "All" || order.status === filter)

        const sortedOrders = filteredOrders.sort((a, b) => sort === "by_date"
            ? new Date(a.timestamp) - new Date(b.timestamp)
            : a.totalPrice - b.totalPrice).slice(0, visibleOrders); // SORT BY DATE OR PRICE

        const tableRow = sortedOrders.map(order => createRow(order)).join("");
        orderTable.innerHTML = tableRow;

        observeLastElement();
    };

    const className = "pt-4 lg:pt-10 pb-2 border px-1 border-gray-200 lg:border-0 lg:border-b whitespace-nowrap";
    const createRow = (order) => {
        return `
            <tr class="border lg:border-0 lg:text-center">
                <td class="${className}">${order.id}</td>
                <td class="${className}">${order.customer}</td>
                <td class="${className}">${order.items.join(", ")}</td>
                <td class="${className}">$${order.totalPrice}</td>
                <td class="${className}">${order.status}</td>
                <td class="${className}">${new Date(order.timestamp).toLocaleString()}</td>
                <td class="${className}">
                    ${order.status === "Pending"
                ? `<button data-id="${order.id}" class="bg-blue-400 text-white px-4 py-2 rounded" onClick="markAsCompleted('${order.id}')">
                        Complete Order
                    </button>` : ""}
                </td>
            </tr>`;
    };

    // MARK ORDER AS COMPLETED
    window.markAsCompleted = (orderId) => {
        const index = orders.findIndex(order => order.id == orderId);
        if (index !== -1) {
            orders[index].status = "Completed";
            renderOrders();
        }
    };

    // DETECT WHEN THE LAST ROW IS VISIBLE
    const observer = new IntersectionObserver((entries) => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting && !isFetching) { // PREVENT CALLING renderOrders FUNCTION MULTIPLE TIMES
            isFetching = true;
            visibleOrders += 5;
            renderOrders();
            isFetching = false;
        }
    }, { threshold: 1.0 });

    // GET THE LAST ELEMENT IN THE TABLE
    const observeLastElement = () => {
        const tableRows = document.querySelectorAll("#order-table tr");
        if (tableRows.length && tableRows.length < orders.length) {
            observer.observe(tableRows[tableRows.length - 1]);
        }
    };

    filterStatus.addEventListener("change", renderOrders);
    sortString.addEventListener("change", renderOrders);
    fetchOrders();
});
