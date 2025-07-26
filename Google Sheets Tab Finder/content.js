function applyHiddenTabsFromStorage() {
    const hiddenTabs = JSON.parse(localStorage.getItem("hiddenTabs")) || [];

    const tryApply = () => {
        const tabs = document.querySelectorAll(".docs-sheet-tab");

        if (tabs.length === 0) return false;

        tabs.forEach(tab => {
            const nameEl = tab.querySelector(".docs-sheet-tab-name");
            if (nameEl && hiddenTabs.includes(nameEl.textContent.trim())) {
                tab.style.display = "none";
            }
        });

        // Ẩn luôn context menu nếu lỡ bị mở ra
        const menu = document.querySelector(".goog-menu");
        if (menu) {
            menu.style.display = "none";
        }

        return true;
    };

    const interval = setInterval(() => {
        const success = tryApply();
        if (success) clearInterval(interval);
    }, 300);
}


//History tabs
function addToHistory(tabName) {
    let historyTabs = JSON.parse(localStorage.getItem("historyTabs")) || [];

    // Đưa tab mới lên đầu, tránh trùng lặp
    historyTabs = historyTabs.filter(name => name !== tabName);
    historyTabs.unshift(tabName);

    // Giới hạn tối đa 10
    if (historyTabs.length > 10) {
        historyTabs = historyTabs.slice(0, 10);
    }

    localStorage.setItem("historyTabs", JSON.stringify(historyTabs));
}

//Khi click vào button tất cả trang tính
function attachPopupTriggerToAllSheetsButton() {
    const observer = new MutationObserver(() => {
        const allSheetsBtn = document.querySelector(
            '.docs-sheet-menu-button[data-tooltip="Tất cả trang tính"], .docs-sheet-menu-button[data-tooltip="All Sheets"]'
        );

        if (allSheetsBtn && !allSheetsBtn.dataset.popupBound) {
            allSheetsBtn.addEventListener("click", (e) => {
                e.stopPropagation(); // Ngăn mở menu mặc định
                e.preventDefault();  // Ngăn hành vi gốc
                toggleSheetTabsPopup(); // Mở popup custom
            });

            allSheetsBtn.dataset.popupBound = "true";
            console.log("✅ Đã gắn toggleSheetTabsPopup() vào nút 'All Sheets'");
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Hiển thị popup khi nhấn vào nút
function toggleSheetTabsPopup() {
    console.log("📜 Đang mở popup...");
    let popup = document.getElementById("sheetTabPopup");
    let searchInput;

    if (!popup) {
        popup = document.createElement("div");
        popup.id = "sheetTabPopup";

        popup.innerHTML = `
            <div id="popupHeader" style="
                position: sticky;
                top: 0;
                background: white;
                z-index: 1000;
                padding: 12px;
                border-bottom: 1px solid #ddd;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                box-sizing: border-box;
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
                box-shadow: 0px 4px 8px rgba(0,0,0,0.03);

                margin-left: -15px;
                margin-right: -15px;
                width: calc(100% + 30px);
            ">
                <span style="
                                    font-size: 24px;
                                    color: #888;
                                    margin-right: 10px;
                                    margin-left: 4px;
                                ">&#128270;
                </span>
                <input type="text" id="searchTabs" placeholder="Search Tab..." style="
                                flex: 1;
                                padding: 12px 14px;
                                border: 1px solid #ccc;
                                border-radius: 8px;
                                font-size: 16px;
                                margin-right: 12px;
                            ">
                <span id="closePopup" style="
                                cursor: pointer;
                                font-size: 40px;
                                line-height: 28px;
                                font-weight: bold;
                                color: #555;
                                transition: transform 0.2s ease, color 0.2 ease;
                            " title="Close popup">&times;</span>
            </div>
            <div style="display: flex; height: calc(100% - 65px); gap: 10px;">
                <ul id="tabList" style="padding:0;margin:0;list-style:none;overflow-y:auto;flex:2;"></ul>
                <div id="historySection" style="flex:1; border-left:1px solid #eee; padding-left: 10px; overflow-y: auto; position: relative; display: flex; flex-direction: column;">

                    <div style="flex: 1; overflow-y: auto;">
                        <h3 style="font-size: 16px; margin-top: 10px;">🕘 History Search</h3>
                        <hr style="border: none; border-top: 1px solid #ccc; margin: 6px 0 10px 0;">
                        <ul id="historyList" style="list-style: none; padding: 0; font-size: 15px; font-weight: bold;"></ul>
                    </div>

                    <div style="position: sticky; bottom: 0; background: white; padding: 10px 0 0 0; margin-top: auto; border-top: 1px solid #eee;">
                        <label style="display: flex; align-items: center; justify-content: space-between;">
                            <span style="font-size: 14px; color: #333;">Hide/Show Button Show All Tabs</span>
                            <label class="switch">
                                <input type="checkbox" id="toggleEagleXBtn" checked>
                                <span class="slider round"></span>
                            </label>
                        </label>
                    </div>
                </div>

                <style>
                    .switch {
                        position: relative;
                        display: inline-block;
                        width: 36px;
                        height: 20px;
                    }
                    .switch input { display: none; }
                    .slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background-color: #ccc;
                        transition: .2s;
                        border-radius: 20px;
                    }
                    .slider:before {
                        position: absolute;
                        content: "";
                        height: 14px;
                        width: 14px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: .2s;
                        border-radius: 50%;
                    }
                    input:checked + .slider {
                        background-color: #1890ff;
                    }
                    input:checked + .slider:before {
                        transform: translateX(16px);
                    }
                </style>

            </div>
            <ul style="
                                padding:0;
                                margin:0;
                                list-style:none;
                                overflow-y: auto;
                            ">
            </ul>
        `;

        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.background = "white";
        popup.style.border = "1px solid #ddd";
        popup.style.borderRadius = "12px";
        popup.style.padding = "0 15px 15px 15px";
        popup.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.3)";
        popup.style.zIndex = "100000";
        popup.style.width = "900px";
        popup.style.height = "80vh";
        popup.style.overflowY = "auto";
        popup.style.display = "none";
        popup.style.boxSizing = "border-box";

        document.body.appendChild(popup);

        // Xử lý toggle ẩn/hiện nút EagleX Dev Tool
        const toggleBtn = popup.querySelector("#toggleEagleXBtn");
        const devBtn = document.getElementById("openSheetPopup");

        if (toggleBtn && devBtn) {
        toggleBtn.checked = devBtn.style.display !== "none";

        toggleBtn.addEventListener("change", function () {
            devBtn.style.display = this.checked ? "block" : "none";
            localStorage.setItem("eaglexBtnVisible", this.checked);
        });
        }

        // event click nut X
        document.getElementById("closePopup").addEventListener("click", () => {
            popup.style.display = "none";
        });

        // Js cho nut X
        const closeBtn = document.getElementById("closePopup");
        closeBtn.addEventListener("mouseenter", () => {
            closeBtn.style.color = "#e74c3c";
            closeBtn.style.transform = "scale(1.2)";
        });
        closeBtn.addEventListener("mouseleave", () => {
            closeBtn.style.color = "#555";
            closeBtn.style.transform = "scale(1)";
        });

        // ESC để đóng popup
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && popup.style.display === "block") {
                popup.style.display = "none";
            }
        });

        // Gắn handler filter input 1 lần
        searchInput = popup.querySelector("#searchTabs");
        searchInput.addEventListener("input", () => {
            const filter = searchInput.value.toLowerCase();
            const allLis = document.querySelectorAll("#sheetTabPopup ul li");

            let hasVisible = false;
            allLis.forEach(li => {
                //Bỏ qua dòng "Not found" cũ (nếu có)
                if (li.id === "tabNotFound") return;

                const isMatch = li.textContent.toLowerCase().includes(filter);
                li.style.display = isMatch ? "block" : "none";
                if (isMatch) hasVisible = true;
            });

            let notFound = document.getElementById("tabNotFound");
            if (!hasVisible) {
                if (!notFound) {
                    notFound = document.createElement("li");
                    notFound.id = "tabNotFound";
                    notFound.textContent = "🔍 Not found this Sheet";
                    notFound.style.textAlign = "center";
                    notFound.style.padding = "20px";
                    notFound.style.color = "#888";
                    notFound.style.fontSize = "18px";
                    document.querySelector("#sheetTabPopup ul").appendChild(notFound);
                }
            } else if (notFound) {
                notFound.remove();
            }
        });
    }

    if (popup.style.display === "block") {
        popup.style.display = "none";
        return;
    }

    const tabList = popup.querySelector("ul");
    searchInput = popup.querySelector("#searchTabs");
    tabList.innerHTML = "";

    const historyList = popup.querySelector("#historyList");
    historyList.innerHTML = "";
    const historyTabs = JSON.parse(localStorage.getItem("historyTabs")) || [];

    historyTabs.forEach(tabName => {
        const li = document.createElement("li");
        li.textContent = tabName;
        li.style.padding = "8px 8px";
        li.style.cursor = "pointer";
        li.style.borderBottom = "1px solid #eee";
        li.title = "Click to move to this tab";

        li.addEventListener("click", () => {
            const tab = [...document.querySelectorAll(".docs-sheet-tab-name")]
                .find(el => el.textContent.trim() === tabName);

            if (tab) {
                const elTab = tab.closest(".docs-sheet-tab");
                if (elTab) {
                    elTab.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
                    elTab.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
                    elTab.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                    addToHistory(tabName); // cập nhật lại lịch sử
                    popup.style.display = "none";
                }
            } else {
                alert("Not found in this Sheet!");
            }
        });

        historyList.appendChild(li);
    });

    tabList.style.display = "block";


    setTimeout(() => {
        const hiddenTabs = JSON.parse(localStorage.getItem("hiddenTabs")) || [];
        applyHiddenTabsFromStorage();

        const tabs = document.querySelectorAll(".docs-sheet-tab");
        console.log(`🔍 Tìm thấy ${tabs.length} tabs trong Google Sheets`);
        if (tabs.length === 0) {
            console.warn("⚠️ Không tìm thấy tab nào trong Google Sheets!");
        }

        tabs.forEach(tab => {
            const li = document.createElement("li");
            const tabName = tab.querySelector(".docs-sheet-tab-name");
            const colorIndicator = tab.querySelector(".docs-sheet-tab-color");
            const isHidden = tab.getAttribute("aria-hidden") === "true" || tab.style.display === "none";
            const isActive = tab.classList.contains("docs-sheet-active-tab");

            let color = "black";
            let textColor = isHidden ? "#A0A0A0" : "#000";

            if (colorIndicator) {
                color = window.getComputedStyle(colorIndicator).backgroundColor;
            }

            const tabText = tabName.textContent.trim();
            const isChecked = hiddenTabs.includes(tabText);

            li.innerHTML = `
                <input type="checkbox" class="tabCheckbox" style="margin-right: 10px; width:20px; height:20px; cursor: pointer;" ${isChecked ? "checked" : ""}>
                <span style='color: ${color}; font-size: 20px;'>●</span>
                <strong style='font-size: 18px; color: ${textColor};'>${tabText}</strong>
            `;

            li.style.padding = "10px";
            li.style.cursor = "pointer";
            li.style.borderBottom = "1px solid #ddd";
            li.title = tabText;

            // Xử lý chuyển tab khi click ngoài checkbox
            li.addEventListener("click", (e) => {
                // Ngăn nếu click vào checkbox
                if (e.target.classList.contains("tabCheckbox")) return;

                console.log(`✅ Chuyển sang tab: ${tabText}`);
                tab.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
                tab.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
                tab.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
                addToHistory(tabText); // cập nhật lại lịch sử
                popup.style.display = "none";
            });

            // Gắn sự kiện riêng cho checkbox
            const checkbox = li.querySelector(".tabCheckbox");
            checkbox.addEventListener("change", (e) => {
                e.stopPropagation(); // Ngăn lan event click checkbox
                let currentHiddenTabs = JSON.parse(localStorage.getItem("hiddenTabs")) || [];

                const isChecked = e.target.checked;

                // Cập nhật localStorage
                if (isChecked) {
                    if (!currentHiddenTabs.includes(tabText)) {
                        currentHiddenTabs.push(tabText);
                    }
                } else {
                    currentHiddenTabs = currentHiddenTabs.filter(name => name !== tabText);
                }
                localStorage.setItem("hiddenTabs", JSON.stringify(currentHiddenTabs));

                // Ẩn/hiện tab ngay lập tức
                const matchingTab = [...document.querySelectorAll(".docs-sheet-tab-name")]
                    .find(el => el.textContent.trim() === tabText);
                if (matchingTab) {
                    const elTab = matchingTab.closest(".docs-sheet-tab");
                    if (elTab) elTab.style.display = isChecked ? "none" : "";
                }
            });

            if (isActive) {
                li.style.backgroundColor = "#e6f7ff";
                li.style.fontWeight = "bold";
                li.style.borderLeft = "5px solid #1890ff";
            }

            tabList.appendChild(li);
        });

        popup.style.display = "block";
        searchInput.value = "";
        searchInput.focus(); // Focus input khi mở
    }, 0);
}

// Tổ hợp phím mở Popup Ctrl + S
// Bắt tổ hợp phím Ctrl + S
document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault(); // Ngăn hành vi lưu trang
      toggleSheetTabsPopup(); // Mở popup tab finder
    }
});

// Thêm nút mở popup
function addPopupButton() {
    let existingButton = document.getElementById("openSheetPopup");
    if (!existingButton) {
        const button = document.createElement("button");
        button.id = "openSheetPopup";
        button.textContent = "📜 Show All Tabs (Ctrl + S)";
        button.style.position = "fixed";
        button.style.bottom = "50px";
        button.style.right = "20px";
        button.style.padding = "10px 15px";
        button.style.border = "none";
        button.style.background = "#007bff";
        button.style.color = "white";
        button.style.borderRadius = "5px";
        button.style.cursor = "pointer";
        button.style.zIndex = "99999";
        button.style.display = localStorage.getItem("eaglexBtnVisible") === "false" ? "none" : "block";
        button.addEventListener("click", toggleSheetTabsPopup);
        document.body.appendChild(button);
        console.log("✅ Nút Show Tabs đã được thêm vào trang!");
    }
}

// Đợi trang tải hoàn toàn trước khi chạy script
window.addEventListener("load", () => {
    localStorage.removeItem("historyTabs"); // Reset khi reload
    setTimeout(() => {
        console.log("🚀 Extension khởi chạy, thêm nút mở popup...");
        addPopupButton();
        applyHiddenTabsFromStorage();
        attachPopupTriggerToAllSheetsButton();
    }, 3000);
});
