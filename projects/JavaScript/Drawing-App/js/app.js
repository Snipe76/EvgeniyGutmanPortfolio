document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.querySelector("canvas");
    const toolBtns = document.querySelectorAll(".tool");
    const sizeSlider = document.querySelector("#size-slider");
    const sizeValue = document.querySelector(".size-value");
    const colorPicker = document.querySelector("#color-picker");
    const quickColors = document.querySelectorAll(".quick-colors .color");
    const recentColorsContainer = document.querySelector("#recent-colors-container");
    const clearCanvasBtn = document.querySelector(".clear-canvas");
    const saveImgBtn = document.querySelector(".save-img");

    // Initialize canvas and context
    let ctx = canvas.getContext("2d", { willReadFrequently: true });
    let prevMouseX, prevMouseY;
    let snapshot;
    let isDrawing = false;
    let selectedTool = "brush";
    let brushWidth = 5;
    let selectedColor = "#0000ff";
    let isFilledShape = false;

    // Recently used colors array
    let recentColors = ["#0000ff"];
    const MAX_RECENT_COLORS = 12;

    // Initialize the app
    function init() {
        // Set canvas size
        setCanvasSize();

        // Update the recent colors display
        updateRecentColorsDisplay();

        // Initialize color picker with Green and force color selection
        colorPicker.value = "#0000ff";
        selectedColor = colorPicker.value;

        // Select the first quick color
        quickColors[0].classList.add("selected");

        // Initialize context with correct color
        ctx.strokeStyle = selectedColor;
        ctx.fillStyle = selectedColor;

        console.log("Drawing App initialized with color:", selectedColor);
    }

    // Throttle function to limit function calls
    function throttle(callback, delay) {
        let previousCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - previousCall >= delay) {
                previousCall = now;
                callback.apply(this, args);
            }
        };
    }

    // Debounce function for events that shouldn't fire too frequently
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Initialize canvas size on page load
    function setCanvasSize() {
        // Get current image data if canvas already has content
        let imageData = null;
        if (canvas.width > 0 && canvas.height > 0) {
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        // Set the canvas dimensions to match the drawing board
        const drawingBoard = document.querySelector(".drawing-board");
        const newWidth = drawingBoard.offsetWidth;
        const newHeight = drawingBoard.offsetHeight;

        // Only resize if dimensions have actually changed
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Fill with white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Restore previous image data if exists
            if (imageData) {
                ctx.putImageData(imageData, 0, 0);
            }
        }
    }

    // Initialize canvas
    window.addEventListener("load", init);

    // Optimize resize listener with debounce
    window.addEventListener("resize", debounce(setCanvasSize, 250));

    // Tool buttons functionality
    toolBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Removing active class from the previous selected button
            document.querySelector(".options .active").classList.remove("active");
            btn.classList.add("active");
            selectedTool = btn.id;

            console.log("Selected tool:", selectedTool);
        });
    });

    // Update brush size
    sizeSlider.addEventListener("input", () => {
        brushWidth = sizeSlider.value;
        sizeValue.innerText = brushWidth;
    });

    // Make the color picker wrapper clickable to open the color picker
    const colorPickerWrapper = document.querySelector(".color-picker-wrapper");
    colorPickerWrapper.addEventListener("click", () => {
        // Programmatically open the color picker
        colorPicker.click();
        console.log("Color picker clicked to open");
    });

    // Color picker handling with both input and change events
    colorPicker.addEventListener("input", () => {
        // Force update selectedColor in real-time
        selectedColor = colorPicker.value;

        // Update context immediately
        updateContextColors();

        console.log("Color picker live selection:", selectedColor);
    });

    colorPicker.addEventListener("change", () => {
        // Force update selectedColor on final selection
        selectedColor = colorPicker.value;

        // Update context
        updateContextColors();

        // Deselect all quick colors
        quickColors.forEach(color => color.classList.remove("selected"));

        console.log("Color picker final selection:", selectedColor);

        // Add to recent colors
        addRecentColor(selectedColor);
    });

    // Helper function to update context colors
    function updateContextColors() {
        // Set the fillStyle for shapes
        ctx.fillStyle = selectedColor;

        // Set the strokeStyle for lines/unfilled shapes
        // (use white for eraser tool, otherwise use the selected color)
        ctx.strokeStyle = selectedTool === "eraser" ? "#ffffff" : selectedColor;
    }

    // Quick color selection
    quickColors.forEach(color => {
        color.addEventListener("click", () => {
            selectQuickColor(color);
        });
    });

    // Function to select a quick color
    function selectQuickColor(colorElement) {
        // Remove selected class from all quick colors
        quickColors.forEach(color => color.classList.remove("selected"));

        // Add selected class to the clicked color
        colorElement.classList.add("selected");

        // Get color from the element and update selected color
        const computedColor = window.getComputedStyle(colorElement).getPropertyValue("background-color");
        selectedColor = rgbToHex(computedColor);

        // Update color picker and indicator
        colorPicker.value = selectedColor;

        // Log for debugging
        console.log("Quick color selected:", selectedColor);

        // Add to recent colors
        addRecentColor(selectedColor);
    }

    // Update recent colors display
    function updateRecentColorsDisplay() {
        // Clear the container
        recentColorsContainer.innerHTML = '';

        // Add recent colors to the display
        recentColors.forEach(color => {
            const colorElement = document.createElement('div');
            colorElement.className = 'color';
            colorElement.style.backgroundColor = color;

            // Add click event to select this color
            colorElement.addEventListener('click', () => {
                // Update selected color
                selectedColor = color;

                // Update color picker and indicator
                colorPicker.value = color;

                // Log for debugging
                console.log("Recent color selected:", selectedColor);

                // Deselect all quick colors
                quickColors.forEach(qColor => qColor.classList.remove("selected"));

                // Check if this color matches any quick color
                quickColors.forEach(qColor => {
                    const qColorHex = rgbToHex(window.getComputedStyle(qColor).getPropertyValue("background-color"));
                    if (qColorHex === color) {
                        qColor.classList.add("selected");
                    }
                });
            });

            recentColorsContainer.appendChild(colorElement);
        });
    }

    // Add color to recent colors
    function addRecentColor(color) {
        // Normalize color to hex format
        color = rgbToHex(color);

        // Remove if color already exists in the array
        const index = recentColors.indexOf(color);
        if (index !== -1) {
            recentColors.splice(index, 1);
        }

        // Add to beginning of array
        recentColors.unshift(color);

        // Trim to max length
        if (recentColors.length > MAX_RECENT_COLORS) {
            recentColors.pop();
        }

        // Update the display
        updateRecentColorsDisplay();
    }

    // Convert RGB to HEX color
    function rgbToHex(rgb) {
        // Extract the r, g, b values from the rgb string
        if (rgb.startsWith('#')) return rgb;

        const rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!rgbMatch) return "#ffffff";

        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);

        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Clear canvas
    clearCanvasBtn.addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Save image
    saveImgBtn.addEventListener("click", () => {
        // Create a temporary link element
        const link = document.createElement("a");
        link.download = `drawing-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        // Trigger a click on the link to download the image
        link.click();
    });

    // Drawing rectangle
    function drawRectangle(e) {
        if (!isFilledShape) {
            // For unfilled rectangle
            ctx.strokeRect(
                prevMouseX,
                prevMouseY,
                e.offsetX - prevMouseX,
                e.offsetY - prevMouseY
            );
        } else {
            // For filled rectangle
            ctx.fillRect(
                prevMouseX,
                prevMouseY,
                e.offsetX - prevMouseX,
                e.offsetY - prevMouseY
            );
        }
    }

    // Drawing circle
    function drawCircle(e) {
        ctx.beginPath();
        // Calculate radius based on mouse position
        let radius = Math.sqrt(
            Math.pow(e.offsetX - prevMouseX, 2) + Math.pow(e.offsetY - prevMouseY, 2)
        );
        ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
        isFilledShape ? ctx.fill() : ctx.stroke();
    }

    // Drawing triangle
    function drawTriangle(e) {
        ctx.beginPath();
        ctx.moveTo(prevMouseX, prevMouseY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
        ctx.closePath();
        isFilledShape ? ctx.fill() : ctx.stroke();
    }

    // Drawing line
    function drawLine(e) {
        ctx.beginPath();
        ctx.moveTo(prevMouseX, prevMouseY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }

    // Optimized bucket fill tool using a scanline fill algorithm
    function bucketFill(x, y) {
        console.log("Starting bucket fill at:", x, y, "with color:", selectedColor);

        // Performance optimization: Set a maximum dimension for performance reasons
        const MAX_DIMENSION = 2000;
        if (canvas.width > MAX_DIMENSION || canvas.height > MAX_DIMENSION) {
            alert("Canvas is too large for fill operation. Try with a smaller canvas size.");
            return;
        }

        // Get the pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Get the target color (color at the clicked position)
        const startIdx = (y * canvas.width + x) * 4;
        const targetR = data[startIdx];
        const targetG = data[startIdx + 1];
        const targetB = data[startIdx + 2];

        console.log("Target color:", targetR, targetG, targetB);

        // Color to fill with
        const fillColor = hexToRgb(selectedColor);

        console.log("Fill color:", fillColor);

        // Check if the clicked color is already the fill color (with tolerance)
        if (Math.abs(targetR - fillColor.r) <= 5 &&
            Math.abs(targetG - fillColor.g) <= 5 &&
            Math.abs(targetB - fillColor.b) <= 5) {
            console.log("Already filled with same/similar color, skipping");
            return; // Exit if colors already match
        }

        // Color tolerance - increased for better results
        const tolerance = 15;

        // Use line scanning algorithm (more efficient than 4-way fill)
        const stack = [[x, y]];
        const width = canvas.width;
        const height = canvas.height;

        // Create a more efficient visited array (Uint8 for memory efficiency)
        const visited = new Uint8Array(width * height);

        // Progress limiting variables - increased for complete fills
        const MAX_ITERATIONS = 2000000; // Increased safety limit
        let iterations = 0;

        while (stack.length > 0 && iterations < MAX_ITERATIONS) {
            iterations++;

            const [x, y] = stack.pop();

            // Find leftmost and rightmost boundaries of the current scanline
            let leftX = x;
            let rightX = x;

            // Find leftmost point that needs to be filled
            while (leftX >= 0 && !visited[y * width + leftX] && pixelMatchesTarget(leftX, y)) {
                leftX--;
            }
            leftX++;

            // Find rightmost point that needs to be filled
            while (rightX < width && !visited[y * width + rightX] && pixelMatchesTarget(rightX, y)) {
                rightX++;
            }
            rightX--;

            // Fill the scanline
            for (let i = leftX; i <= rightX; i++) {
                const pixelPos = y * width + i;

                // Skip if already visited
                if (visited[pixelPos]) continue;

                // Mark as visited
                visited[pixelPos] = 1;

                // Fill pixel
                const idx = pixelPos * 4;
                data[idx] = fillColor.r;
                data[idx + 1] = fillColor.g;
                data[idx + 2] = fillColor.b;

                // Check pixels above and below to add to stack
                if (y > 0 && !visited[(y - 1) * width + i] && pixelMatchesTarget(i, y - 1)) {
                    stack.push([i, y - 1]);
                }

                if (y < height - 1 && !visited[(y + 1) * width + i] && pixelMatchesTarget(i, y + 1)) {
                    stack.push([i, y + 1]);
                }
            }
        }

        // Helper function to check if a pixel matches the target color
        function pixelMatchesTarget(x, y) {
            const idx = (y * width + x) * 4;
            return Math.abs(data[idx] - targetR) <= tolerance &&
                Math.abs(data[idx + 1] - targetG) <= tolerance &&
                Math.abs(data[idx + 2] - targetB) <= tolerance;
        }

        // Check if iteration limit was reached
        if (iterations >= MAX_ITERATIONS) {
            console.warn("Fill operation stopped early due to iteration limit.");
        } else {
            console.log("Fill operation completed successfully in", iterations, "iterations");
        }

        // Apply changes
        ctx.putImageData(imageData, 0, 0);
    }

    // Helper function to convert hex color to RGB
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }

    // Start drawing - Modified to ensure color is applied
    function startDraw(e) {
        isDrawing = true;
        prevMouseX = e.offsetX;
        prevMouseY = e.offsetY;

        // For bucket tool, fill immediately on click
        if (selectedTool === "bucket") {
            isDrawing = false;
            canvas.style.cursor = 'wait';
            requestAnimationFrame(() => {
                try {
                    bucketFill(prevMouseX, prevMouseY);
                } catch (err) {
                    console.error("Error in bucket fill:", err);
                    alert("Error filling area. Try a smaller area or refresh the page.");
                } finally {
                    canvas.style.cursor = 'default';
                }
            });
            return;
        }

        // Force update context colors before starting to draw
        updateContextColors();

        ctx.beginPath();
        ctx.lineWidth = brushWidth;

        // Take a snapshot of the current canvas
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    // Optimize drawing with throttle
    const throttledDrawing = throttle(drawing, 10);

    // Drawing
    function drawing(e) {
        if (!isDrawing) return;

        // Skip drawing for bucket tool as it's handled in startDraw
        if (selectedTool === "bucket") return;

        // Force update colors again to ensure latest color is used
        updateContextColors();

        // Restore the snapshot before drawing to avoid multiple shape overlays
        if (selectedTool !== "brush" && selectedTool !== "eraser") {
            ctx.putImageData(snapshot, 0, 0);
        }

        switch (selectedTool) {
            case "brush":
            case "eraser":
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke();
                break;
            case "rectangle":
                drawRectangle(e);
                break;
            case "circle":
                drawCircle(e);
                break;
            case "triangle":
                drawTriangle(e);
                break;
            case "line":
                drawLine(e);
                break;
        }
    }

    // Stop drawing
    function stopDraw() {
        isDrawing = false;
    }

    // Update isFilledShape based on alt key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Alt') {
            isFilledShape = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'Alt') {
            isFilledShape = false;
        }
    });

    // Mouse event listeners for desktop
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", throttledDrawing);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);

    // Touch event listeners for mobile
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        mouseEvent.offsetX = touch.clientX - rect.left;
        mouseEvent.offsetY = touch.clientY - rect.top;
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        mouseEvent.offsetX = touch.clientX - rect.left;
        mouseEvent.offsetY = touch.clientY - rect.top;
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener("touchend", () => {
        const mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener("touchcancel", () => {
        const mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    });
}); 