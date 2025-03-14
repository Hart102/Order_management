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
            const response = await fetch("https://hart102.github.io/Order_management/orders.json");
            orders = await response.json();
            renderOrders();
        } catch (error) {
            console.log("Error fetching orders:", error);
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

    const createRow = (order) => {
        return `
            <tr>
                <td class="row-cell">${order.id}</td>
                <td class="row-cell">${order.customer}</td>
                <td class="row-cell">${order.items.join(", ")}</td>
                <td class="row-cell">$${order.totalPrice}</td>
                <td class="row-cell">${order.status}</td>
                <td class="row-cell">${new Date(order.timestamp).toLocaleString()}</td>
                <td class="row-cell">
                    ${order.status === "Pending" ? `<button data-id="${order.id}" class="complete-button" onClick="markAsCompleted('${order.id}')">Complete Order</button>` : ""}
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
    }, { threshold: 0.01, rootMargin: "200px" });

    // GET THE LAST ELEMENT IN THE TABLE
    const observeLastElement = () => {
        setTimeout(() => {
            const tableRows = document.querySelectorAll("#order-table tr");
            if (tableRows.length && tableRows.length < orders.length) {
                observer.observe(tableRows[tableRows.length - 1]);
            }
        }, 300);
    };

    // WATCH FOR DYNAMIC CHANGES IN THE TABLE
    const mutationObserver = new MutationObserver(observeLastElement);
    mutationObserver.observe(orderTable, { childList: true });

    filterStatus.addEventListener("change", renderOrders);
    sortString.addEventListener("change", renderOrders);
    fetchOrders();
});
