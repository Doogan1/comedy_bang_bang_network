export function highlightActiveTab(currentEntityType) {
    // Remove 'selected' class from tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('selected'));

    // Add 'selected' to the tab matching the current entity type
    const currentTabId = `tab-${currentEntityType}`;
    const currentTab = document.getElementById(currentTabId);
    currentTab.classList.add('selected');
    
}

export function resizeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const resizer = document.querySelector('.sidebar .resizer');

    let isResizing = false;
    let startWidth;
    let startX;
    let scrollbarWidth = 0;

    resizer.addEventListener('mousedown', function(e) {
        isResizing = true;
        startX = e.clientX;
        startWidth = parseInt(window.getComputedStyle(sidebar).width, 10);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault(); // there was an issue where text was being selected on drag which is the default behavior
        // Check if there's a scrollbar
        if (sidebar.scrollHeight > sidebar.clientHeight) {
            // Scrollbar is visible, calculate its width
            scrollbarWidth = sidebar.offsetWidth - sidebar.clientWidth;
        }
        else {
            scrollbarWidth = 0;
        }
    });

    function handleMouseMove(e) {
        if (!isResizing) return;
        let deltaX = e.clientX - startX;
        let newWidth = startWidth - deltaX + scrollbarWidth;
    
        // Check for minimum width to avoid too small sidebar
        if (newWidth > 100) {
            sidebar.style.width = `${newWidth}px`;
        }
    }

    function stopResize(e) {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResize);
        e.stopPropagation();  // Need this to prevent a mouseup on the svg element which was causing issues
    }
}
