// ================================
// SOFTCRONW PAYMENTS SYSTEM
// Sistema completo de pagos y presupuestos
// ================================

document.addEventListener('DOMContentLoaded', function() {
    initPaymentSystem();
    initBudgetCalculator();
    initTooltips();
    initPaymentAnimations();
    initTestimonials();
    initTimeline();
    console.log('💳 SoftCronw Payment System Initialized');
});

// ================================
// SISTEMA DE PAGOS PRINCIPAL
// ================================

function initPaymentSystem() {
    initBankModal();
    initPayPalIntegration();
    initNotificationSystem();
    initPaymentValidation();
}

// Modal de datos bancarios
function initBankModal() {
    const bankModal = document.getElementById('bank-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    
    if (!bankModal) return;
    
    modalOverlay?.addEventListener('click', closeBankModal);
    modalClose?.addEventListener('click', closeBankModal);
    
    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && bankModal.style.display === 'block') {
            closeBankModal();
        }
    });
}

function showBankDetails() {
    const modal = document.getElementById('bank-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Animación de entrada
        setTimeout(() => {
            modal.classList.add('modal--show');
        }, 10);
    }
}

function closeBankModal() {
    const modal = document.getElementById('bank-modal');
    if (modal) {
        modal.classList.remove('modal--show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

// Copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showNotification('Copiado al portapapeles', 'success');
    }).catch(function(err) {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Copiado al portapapeles', 'success');
    });
}

// PayPal Integration
function initPayPalIntegration() {
    // Simulación de integración PayPal
    window.payWithPayPal = function() {
        showNotification('Redirigiendo a PayPal...', 'info');
        
        // Aquí iría la integración real con PayPal
        setTimeout(() => {
            showNotification('Esta es una demo. Integración PayPal pendiente.', 'warning');
        }, 2000);
    };
}

// Notificaciones de tarjeta próximamente
function notifyWhenReady() {
    const email = prompt('Ingresa tu email para notificarte cuando esté disponible:');
    if (email && validateEmail(email)) {
        showNotification('Te notificaremos cuando esté disponible', 'success');
        // Aquí se guardaría el email para notificaciones
    } else if (email) {
        showNotification('Email inválido', 'error');
    }
}

// ================================
// CALCULADORA DE PRESUPUESTO
// ================================

function initBudgetCalculator() {
    createBudgetCalculator();
}

function createBudgetCalculator() {
    const calculatorHTML = `
        <div class="budget-calculator" id="budget-calculator">
            <div class="calculator-header">
                <h3>Calculadora de Presupuesto</h3>
                <p>Calcula el costo estimado de tu proyecto</p>
            </div>
            
            <div class="calculator-content">
                <div class="calculator-section">
                    <label>Tipo de Proyecto</label>
                    <select id="project-type" onchange="updateBudget()">
                        <option value="landing">Landing Page - €800-1,500</option>
                        <option value="corporate">Web Corporativa - €1,500-3,000</option>
                        <option value="ecommerce">E-commerce - €3,000-6,000</option>
                        <option value="webapp">Web App - €5,000-15,000</option>
                        <option value="mobile">App Móvil - €8,000-20,000</option>
                    </select>
                </div>
                
                <div class="calculator-section">
                    <label>Funcionalidades Extra</label>
                    <div class="checkbox-group">
                        <label class="checkbox-item">
                            <input type="checkbox" value="200" onchange="updateBudget()"> 
                            <span>SEO Avanzado (+€200)</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="300" onchange="updateBudget()"> 
                            <span>Integración CRM (+€300)</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="400" onchange="updateBudget()"> 
                            <span>Sistema de Pago (+€400)</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="250" onchange="updateBudget()"> 
                            <span>Multiidioma (+€250)</span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" value="150" onchange="updateBudget()"> 
                            <span>Analytics Avanzado (+€150)</span>
                        </label>
                    </div>
                </div>
                
                <div class="calculator-section">
                    <label>Complejidad del Diseño</label>
                    <div class="radio-group">
                        <label class="radio-item">
                            <input type="radio" name="complexity" value="1" checked onchange="updateBudget()">
                            <span>Básico (x1)</span>
                        </label>
                        <label class="radio-item">
                            <input type="radio" name="complexity" value="1.3" onchange="updateBudget()">
                            <span>Intermedio (x1.3)</span>
                        </label>
                        <label class="radio-item">
                            <input type="radio" name="complexity" value="1.6" onchange="updateBudget()">
                            <span>Avanzado (x1.6)</span>
                        </label>
                    </div>
                </div>
                
                <div class="calculator-result">
                    <div class="result-breakdown">
                        <div class="breakdown-item">
                            <span>Proyecto Base:</span>
                            <span id="base-cost">€800-1,500</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Funcionalidades Extra:</span>
                            <span id="extra-cost">€0</span>
                        </div>
                        <div class="breakdown-item">
                            <span>Multiplicador Complejidad:</span>
                            <span id="complexity-multiplier">x1</span>
                        </div>
                        <div class="breakdown-total">
                            <span>Total Estimado:</span>
                            <span id="total-cost">€800-1,500</span>
                        </div>
                    </div>
                    
                    <div class="payment-breakdown">
                        <div class="payment-phase">
                            <i class="fas fa-play-circle"></i>
                            <span>50% al inicio: <strong id="initial-payment">€400-750</strong></span>
                        </div>
                        <div class="payment-phase">
                            <i class="fas fa-check-circle"></i>
                            <span>50% al final: <strong id="final-payment">€400-750</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="calculator-actions">
                    <button class="btn btn--primary" onclick="requestQuote()">
                        <i class="fas fa-paper-plane"></i>
                        Solicitar Presupuesto Detallado
                    </button>
                    <button class="btn btn--secondary" onclick="shareEstimate()">
                        <i class="fas fa-share-alt"></i>
                        Compartir Estimación
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Insertar calculadora después de la sección de estructura de pago
    const paymentStructure = document.querySelector('.payment-structure');
    if (paymentStructure) {
        paymentStructure.insertAdjacentHTML('afterend', calculatorHTML);
    }
}

function updateBudget() {
    const projectType = document.getElementById('project-type').value;
    const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]:checked');
    const complexity = document.querySelector('input[name="complexity"]:checked').value;
    
    // Precios base por tipo de proyecto
    const basePrices = {
        landing: { min: 800, max: 1500, name: 'Landing Page' },
        corporate: { min: 1500, max: 3000, name: 'Web Corporativa' },
        ecommerce: { min: 3000, max: 6000, name: 'E-commerce' },
        webapp: { min: 5000, max: 15000, name: 'Web App' },
        mobile: { min: 8000, max: 20000, name: 'App Móvil' }
    };
    
    const basePrice = basePrices[projectType];
    
    // Calcular extras
    let extraCost = 0;
    checkboxes.forEach(checkbox => {
        extraCost += parseInt(checkbox.value);
    });
    
    // Aplicar multiplicador de complejidad
    const complexityMultiplier = parseFloat(complexity);
    const minTotal = Math.round((basePrice.min + extraCost) * complexityMultiplier);
    const maxTotal = Math.round((basePrice.max + extraCost) * complexityMultiplier);
    
    // Actualizar interfaz
    document.getElementById('base-cost').textContent = `€${basePrice.min}-${basePrice.max}`;
    document.getElementById('extra-cost').textContent = `€${extraCost}`;
    document.getElementById('complexity-multiplier').textContent = `x${complexityMultiplier}`;
    document.getElementById('total-cost').textContent = `€${minTotal}-${maxTotal}`;
    
    // Calcular pagos
    const initialMin = Math.round(minTotal * 0.5);
    const initialMax = Math.round(maxTotal * 0.5);
    const finalMin = minTotal - initialMin;
    const finalMax = maxTotal - initialMax;
    
    document.getElementById('initial-payment').textContent = `€${initialMin}-${initialMax}`;
    document.getElementById('final-payment').textContent = `€${finalMin}-${finalMax}`;
    
    // Animar cambios
    animateNumberChange(document.getElementById('total-cost'));
}

function animateNumberChange(element) {
    element.style.transform = 'scale(1.1)';
    element.style.color = '#1e3a8a';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 200);
}

function requestQuote() {
    showNotification('Redirigiendo a formulario de presupuesto...', 'info');
    setTimeout(() => {
        window.location.href = 'contacto.html?type=presupuesto';
    }, 1000);
}

function shareEstimate() {
    const projectType = document.getElementById('project-type').selectedOptions[0].text;
    const totalCost = document.getElementById('total-cost').textContent;
    
    const shareText = `Estimación SoftCronw:\n${projectType}\nTotal: ${totalCost}\n\nSolicita tu presupuesto en: https://softcronw.com`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Estimación SoftCronw',
            text: shareText,
            url: window.location.href
        });
    } else {
        copyToClipboard(shareText);
        showNotification('Estimación copiada al portapapeles', 'success');
    }
}

// ================================
// TOOLTIPS EXPLICATIVOS
// ================================

function initTooltips() {
    createTooltips();
    handleTooltipEvents();
}

function createTooltips() {
    const tooltipData = [
        {
            selector: '.payment-icon',
            text: 'Método de pago seguro y verificado'
        },
        {
            selector: '.trust-badge',
            text: 'Certificación de seguridad garantizada'
        },
        {
            selector: '.phase-timing',
            text: 'Tiempo estimado para esta fase del proyecto'
        },
        {
            selector: '.condition-value',
            text: 'Valor incluido sin costo adicional'
        },
        {
            selector: '.security-icon',
            text: 'Medida de seguridad implementada'
        }
    ];
    
    tooltipData.forEach(tooltip => {
        const elements = document.querySelectorAll(tooltip.selector);
        elements.forEach(element => {
            element.setAttribute('data-tooltip', tooltip.text);
            element.classList.add('tooltip-trigger');
        });
    });
}

function handleTooltipEvents() {
    let currentTooltip = null;
    
    document.addEventListener('mouseenter', function(e) {
        if (e.target.hasAttribute('data-tooltip')) {
            showTooltip(e.target, e.target.getAttribute('data-tooltip'));
        }
    }, true);
    
    document.addEventListener('mouseleave', function(e) {
        if (e.target.hasAttribute('data-tooltip')) {
            hideTooltip();
        }
    }, true);
    
    function showTooltip(element, text) {
        hideTooltip(); // Ocultar tooltip anterior
        
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Posicionar tooltip
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 10;
        
        // Ajustar si se sale de la pantalla
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) {
            top = rect.bottom + 10;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        
        setTimeout(() => {
            tooltip.classList.add('tooltip--show');
        }, 10);
        
        currentTooltip = tooltip;
    }
    
    function hideTooltip() {
        if (currentTooltip) {
            currentTooltip.classList.remove('tooltip--show');
            setTimeout(() => {
                if (currentTooltip && currentTooltip.parentNode) {
                    currentTooltip.parentNode.removeChild(currentTooltip);
                }
                currentTooltip = null;
            }, 200);
        }
    }
}

// ================================
// ANIMACIONES DE PAGO
// ================================

function initPaymentAnimations() {
    animatePaymentCards();
    animateProgressBars();
    animateCounters();
}

function animatePaymentCards() {
    const paymentCards = document.querySelectorAll('.payment-card');
    
    paymentCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.payment-icon');
            const glow = this.querySelector('.icon-glow');
            
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
            if (glow) {
                glow.style.opacity = '1';
                glow.style.transform = 'scale(1.5)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.payment-icon');
            const glow = this.querySelector('.icon-glow');
            
            if (icon) {
                icon.style.transform = '';
            }
            if (glow) {
                glow.style.opacity = '0';
                glow.style.transform = 'scale(1)';
            }
        });
    });
}

function animateProgressBars() {
    const progressLine = document.querySelector('.progress-line');
    const progressCircles = document.querySelectorAll('.progress-circle');
    
    if (progressLine) {
        setTimeout(() => {
            progressLine.style.width = '100%';
        }, 1000);
        
        progressCircles.forEach((circle, index) => {
            setTimeout(() => {
                circle.classList.add('active');
            }, 1500 + (index * 500));
        });
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('.condition-value');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                
                // Animar números
                if (text.includes('€') || text.includes('%') || text.includes('h')) {
                    animateNumber(element, text);
                }
                
                observer.unobserve(element);
            }
        });
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateNumber(element, finalText) {
    const number = finalText.match(/\d+/);
    if (number) {
        const target = parseInt(number[0]);
        const prefix = finalText.substring(0, finalText.indexOf(number[0]));
        const suffix = finalText.substring(finalText.indexOf(number[0]) + number[0].length);
        
        let current = 0;
        const increment = target / 30;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = prefix + Math.floor(current) + suffix;
        }, 50);
    }
}

// ================================
// TESTIMONIOS DE SATISFACCIÓN
// ================================

function initTestimonials() {
    createTestimonialsSection();
    initTestimonialSlider();
}

function createTestimonialsSection() {
    const testimonialsHTML = `
        <section class="testimonials-section">
            <div class="container">
                <div class="section-header" data-aos="fade-up">
                    <h2 class="section-title">
                        Testimonios de <span class="text-gradient">Satisfacción</span>
                    </h2>
                    <p class="section-subtitle">
                        Lo que dicen nuestros clientes sobre nuestro servicio
                    </p>
                </div>
                
                <div class="testimonials-slider">
                    <div class="testimonial-card active" data-aos="fade-up" data-aos-delay="100">
                        <div class="testimonial-content">
                            <div class="testimonial-stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                            <p class="testimonial-text">
                                "Excelente servicio, cumplieron todos los plazos y el resultado superó nuestras expectativas. El proceso de pago fue muy transparente."
                            </p>
                            <div class="testimonial-author">
                                <img src="https://via.placeholder.com/60x60" alt="Cliente" class="author-avatar">
                                <div class="author-info">
                                    <h4 class="author-name">María García</h4>
                                    <span class="author-company">TechStart Solutions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="testimonial-card" data-aos="fade-up" data-aos-delay="200">
                        <div class="testimonial-content">
                            <div class="testimonial-stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                            <p class="testimonial-text">
                                "La estructura de pago 50/50 nos dio mucha confianza. Comunicación perfecta durante todo el proyecto."
                            </p>
                            <div class="testimonial-author">
                                <img src="https://via.placeholder.com/60x60" alt="Cliente" class="author-avatar">
                                <div class="author-info">
                                    <h4 class="author-name">Carlos Rodríguez</h4>
                                    <span class="author-company">Innovate Corp</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="testimonial-card" data-aos="fade-up" data-aos-delay="300">
                        <div class="testimonial-content">
                            <div class="testimonial-stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                            <p class="testimonial-text">
                                "Métodos de pago flexibles y seguros. El soporte post-entrega de 30 días fue muy útil."
                            </p>
                            <div class="testimonial-author">
                                <img src="https://via.placeholder.com/60x60" alt="Cliente" class="author-avatar">
                                <div class="author-info">
                                    <h4 class="author-name">Ana López</h4>
                                    <span class="author-company">Digital Ventures</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="testimonials-controls">
                    <button class="testimonial-btn testimonial-btn--prev" onclick="changeTestimonial(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="testimonial-indicators">
                        <span class="indicator active" onclick="goToTestimonial(0)"></span>
                        <span class="indicator" onclick="goToTestimonial(1)"></span>
                        <span class="indicator" onclick="goToTestimonial(2)"></span>
                    </div>
                    <button class="testimonial-btn testimonial-btn--next" onclick="changeTestimonial(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </section>
    `;
    
    // Insertar testimonios antes de la sección CTA
    const ctaSection = document.querySelector('.payment-cta');
    if (ctaSection) {
        ctaSection.insertAdjacentHTML('beforebegin', testimonialsHTML);
    }
}

function initTestimonialSlider() {
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial-card');
    const indicators = document.querySelectorAll('.testimonial-indicators .indicator');
    
    // Auto-slide cada 5 segundos
    setInterval(() => {
        changeTestimonial(1);
    }, 5000);
    
    window.changeTestimonial = function(direction) {
        testimonials[currentTestimonial].classList.remove('active');
        indicators[currentTestimonial].classList.remove('active');
        
        currentTestimonial += direction;
        
        if (currentTestimonial >= testimonials.length) {
            currentTestimonial = 0;
        } else if (currentTestimonial < 0) {
            currentTestimonial = testimonials.length - 1;
        }
        
        testimonials[currentTestimonial].classList.add('active');
        indicators[currentTestimonial].classList.add('active');
    };
    
    window.goToTestimonial = function(index) {
        testimonials[currentTestimonial].classList.remove('active');
        indicators[currentTestimonial].classList.remove('active');
        
        currentTestimonial = index;
        
        testimonials[currentTestimonial].classList.add('active');
        indicators[currentTestimonial].classList.add('active');
    };
}

// ================================
// TIMELINE MEJORADO
// ================================

function initTimeline() {
    enhanceTimeline();
    initTimelineAnimations();
}

function enhanceTimeline() {
    const timeline = document.querySelector('.payment-timeline');
    if (!timeline) return;
    
    // Agregar información adicional al timeline
    const timelineSteps = `
        <div class="timeline-steps">
            <div class="timeline-step" data-aos="fade-up" data-aos-delay="100">
                <div class="step-number">1</div>
                <div class="step-content">
                    <h4>Consulta Inicial</h4>
                    <p>Análisis gratuito de requerimientos</p>
                    <span class="step-time">24h</span>
                </div>
            </div>
            
            <div class="timeline-step" data-aos="fade-up" data-aos-delay="200">
                <div class="step-number">2</div>
                <div class="step-content">
                    <h4>Presupuesto Detallado</h4>
                    <p>Propuesta completa con tiempos y costos</p>
                    <span class="step-time">48h</span>
                </div>
            </div>
            
            <div class="timeline-step" data-aos="fade-up" data-aos-delay="300">
                <div class="step-number">3</div>
                <div class="step-content">
                    <h4>Primer Pago (50%)</h4>
                    <p>Inicio del proyecto tras confirmación</p>
                    <span class="step-time">Inmediato</span>
                </div>
            </div>
            
            <div class="timeline-step" data-aos="fade-up" data-aos-delay="400">
                <div class="step-number">4</div>
                <div class="step-content">
                    <h4>Desarrollo</h4>
                    <p>Creación del proyecto con actualizaciones</p>
                    <span class="step-time">2-8 semanas</span>
                </div>
            </div>
            
            <div class="timeline-step" data-aos="fade-up" data-aos-delay="500">
                <div class="step-number">5</div>
                <div class="step-content">
                    <h4>Revisiones</h4>
                    <p>Hasta 3 rondas de ajustes incluidas</p>
                    <span class="step-time">1-2 semanas</span>
                </div>
            </div>
            
            <div class="timeline-step" data-aos="fade-up" data-aos-delay="600">
                <div class="step-number">6</div>
                <div class="step-content">
                    <h4>Entrega y Pago Final</h4>
                    <p>Segundo pago (50%) al completar</p>
                    <span class="step-time">Inmediato</span>
                </div>
            </div>
        </div>
    `;
    
    timeline.insertAdjacentHTML('beforeend', timelineSteps);
}

function initTimelineAnimations() {
    const timelineSteps = document.querySelectorAll('.timeline-step');
    
    timelineSteps.forEach((step, index) => {
        step.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
            this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
        });
        
        step.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

// ================================
// SISTEMA DE NOTIFICACIONES
// ================================

function initNotificationSystem() {
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type]}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="closeNotification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const container = document.querySelector('.notification-container');
    container.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('notification--show');
    }, 100);
    
    // Auto-remove después de 4 segundos
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, 4000);
}

function closeNotification(button) {
    const notification = button.parentElement;
    notification.classList.remove('notification--show');
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 300);
}

// ================================
// VALIDACIÓN DE FORMULARIOS
// ================================

function initPaymentValidation() {
    // Validación para futuros formularios de pago
    window.validateEmail = function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    window.validatePhone = function(phone) {
        const phoneRegex = /^[+]?[\d\s\-\(\)]{9,15}$/;
        return phoneRegex.test(phone);
    };
    
    window.validateForm = function(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                showFieldError(input, 'Este campo es obligatorio');
                isValid = false;
            } else if (input.type === 'email' && !validateEmail(input.value)) {
                showFieldError(input, 'Email inválido');
                isValid = false;
            } else if (input.type === 'tel' && !validatePhone(input.value)) {
                showFieldError(input, 'Teléfono inválido');
                isValid = false;
            } else {
                clearFieldError(input);
            }
        });
        
        return isValid;
    };
    
    function showFieldError(field, message) {
        field.classList.add('field-error');
        
        let errorElement = field.parentElement.querySelector('.field-error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error-message';
            field.parentElement.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }
    
    function clearFieldError(field) {
        field.classList.remove('field-error');
        
        const errorElement = field.parentElement.querySelector('.field-error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
}

// ================================
// UTILIDADES GLOBALES
// ================================

// Hacer funciones disponibles globalmente
window.showBankDetails = showBankDetails;
window.closeBankModal = closeBankModal;
window.copyToClipboard = copyToClipboard;
window.payWithPayPal = payWithPayPal;
window.notifyWhenReady = notifyWhenReady;
window.updateBudget = updateBudget;
window.requestQuote = requestQuote;
window.shareEstimate = shareEstimate;
window.showNotification = showNotification;
window.closeNotification = closeNotification;

// Inicializar calculadora por defecto
window.addEventListener('load', function() {
    if (typeof updateBudget === 'function') {
        updateBudget();
    }
});

console.log('💼 SoftCronw Payment System Ready!'); 