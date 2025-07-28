import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Function to create charts for PDF
const createPDFCharts = async (pieData: any, barData: any): Promise<void> => {
  return new Promise((resolve) => {
    // Wait for Chart.js to be available
    const checkChart = () => {
      if (typeof window !== 'undefined' && window.Chart) {
        // Create pie chart
        const pieCanvas = document.getElementById('pdf-pie-chart') as HTMLCanvasElement;
        if (pieCanvas) {
          const pieCtx = pieCanvas.getContext('2d');
          if (pieCtx) {
            new window.Chart(pieCtx, {
              type: 'pie',
              data: pieData,
              options: {
                responsive: false,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      font: { size: 10 }
                    }
                  }
                }
              }
            });
          }
        }

        // Create bar chart
        const barCanvas = document.getElementById('pdf-bar-chart') as HTMLCanvasElement;
        if (barCanvas) {
          const barCtx = barCanvas.getContext('2d');
          if (barCtx) {
            new window.Chart(barCtx, {
              type: 'bar',
              data: barData,
              options: {
                responsive: false,
                maintainAspectRatio: false,
                animation: false,
                scales: {
                  yLength: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Length (in)', font: { size: 10 } }
                  },
                  yCost: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Cost ($)', font: { size: 10 } },
                    grid: { drawOnChartArea: false }
                  }
                },
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      font: { size: 10 }
                    }
                  }
                }
              }
            });
          }
        }
        
        // Wait a bit for charts to render
        setTimeout(resolve, 300);
      } else {
        // Retry after a short delay
        setTimeout(checkChart, 100);
      }
    };
    
    checkChart();
  });
};

export const exportToPDF = async (filename: string = 'woodworks-estimate.pdf', pieData?: any, barData?: any): Promise<boolean> => {
  let originalStyles: Map<Element, string> = new Map();
  
  try {
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading';
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="margin-bottom: 10px;">Generating PDF...</div>
          <div style="width: 200px; height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
            <div style="width: 100%; height: 100%; background: #5a3a22; animation: loading 2s infinite;"></div>
          </div>
        </div>
      </div>
      <style>
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      </style>
    `;
    document.body.appendChild(loadingDiv);

    // Store original styles and modify elements for PDF
    const noExportElements = document.querySelectorAll('.no-export');
    const exportOnlyElements = document.querySelectorAll('.export-only-block, .export-only-flex, .export-only-inline');
    const pdfChartContainer = document.querySelector('.pdf-chart-container') as HTMLElement;
    
    // Hide no-export elements
    noExportElements.forEach(el => {
      const element = el as HTMLElement;
      originalStyles.set(element, element.style.display);
      element.style.display = 'none';
    });
    
    // Show export-only elements
    exportOnlyElements.forEach(el => {
      const element = el as HTMLElement;
      originalStyles.set(element, element.style.display);
      if (element.classList.contains('export-only-block')) {
        element.style.display = 'block';
      } else if (element.classList.contains('export-only-flex')) {
        element.style.display = 'flex';
      } else if (element.classList.contains('export-only-inline')) {
        element.style.display = 'inline';
      }
    });

    // Show PDF chart container and create charts
    if (pdfChartContainer) {
      originalStyles.set(pdfChartContainer, pdfChartContainer.style.display);
      pdfChartContainer.classList.add('show-in-pdf');
      
      // Create charts if data is provided
      if (pieData && barData) {
        await createPDFCharts(pieData, barData);
      }
    }

    // Wait for DOM to update and charts to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Get the printable area
    const element = document.querySelector('.printable-area') as HTMLElement;
    if (!element) {
      throw new Error('Printable area not found');
    }

    // Create canvas from HTML with better options
    const canvas = await html2canvas(element, {
      scale: 1.5, // Good balance between quality and performance
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Create PDF with proper sizing
    const imgData = canvas.toDataURL('image/png', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Calculate dimensions to fit page properly
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // 10mm margin
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2);
    
    const canvasAspectRatio = canvas.height / canvas.width;
    let imgWidth = availableWidth;
    let imgHeight = imgWidth * canvasAspectRatio;
    
    // If content is too tall for one page, split it
    if (imgHeight > availableHeight) {
      // Scale to fit width, then handle multiple pages
      const scale = availableWidth / canvas.width;
      const scaledHeight = canvas.height * scale;
      
      if (scaledHeight <= availableHeight) {
        // Fits in one page after scaling
        imgWidth = availableWidth;
        imgHeight = scaledHeight;
        const imgX = margin;
        const imgY = margin;
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');
      } else {
        // Need multiple pages - for now, scale to fit one page
        imgHeight = availableHeight;
        imgWidth = imgHeight / canvasAspectRatio;
        const imgX = (pdfWidth - imgWidth) / 2;
        const imgY = margin;
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');
      }
    } else {
      // Fits in one page
      const imgX = (pdfWidth - imgWidth) / 2;
      const imgY = margin;
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');
    }

    // Save the PDF
    pdf.save(filename);
    
    return true;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Falling back to browser print dialog.');
    // Fallback to browser print
    window.print();
    return false;
    
  } finally {
    // Restore original styles
    originalStyles.forEach((originalDisplay, element) => {
      (element as HTMLElement).style.display = originalDisplay;
    });
    
    // Hide PDF chart container
    const pdfChartContainer = document.querySelector('.pdf-chart-container') as HTMLElement;
    if (pdfChartContainer) {
      pdfChartContainer.classList.remove('show-in-pdf');
    }
    
    // Remove loading indicator
    const loadingDiv = document.getElementById('pdf-loading');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }
};