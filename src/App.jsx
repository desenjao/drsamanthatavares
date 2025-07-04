import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTooth, faTeeth, faTeethOpen, faBrush, faMapMarkerAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const slides = [
    '/images/image1.jpg',
    '/images/image2.jpg',
    '/images/image3.jpg',
    '/images/image4.jpg',
    '/images/image5.jpg',
    '/images/image6.jpg',
    '/images/image7.jpg',
    '/images/image5.jpg'
  ];

  // Pré-carregamento de imagens do carrossel
  useEffect(() => {
    const preloadImages = () => {
      const preloadLinks = [];
      for (let i = 0; i < 3; i++) {
        const nextIndex = (currentSlide + i) % slides.length;
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = slides[nextIndex];
        link.as = 'image';
        document.head.appendChild(link);
        preloadLinks.push(link);
      }
      return () => {
        preloadLinks.forEach(link => document.head.removeChild(link));
      };
    };
    preloadImages();
  }, [currentSlide, slides]);

  // Lógica do carrossel
  useEffect(() => {
    if (!isCarouselPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [slides.length, isCarouselPaused]);

  const showSlide = (index) => {
    setCurrentSlide(index);
    setIsCarouselPaused(true);
    setTimeout(() => setIsCarouselPaused(false), 30000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsCarouselPaused(true);
    setTimeout(() => setIsCarouselPaused(false), 30000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsCarouselPaused(true);
    setTimeout(() => setIsCarouselPaused(false), 30000);
  };

  // Componente Before-After Slider
  const BeforeAfterSlider = memo(({ beforeImage, afterImage, altText }) => {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [sliderPosition, setSliderPosition] = useState(50);
    const [showInstruction, setShowInstruction] = useState(true);
    const rafId = useRef(null);

    // Pré-carregamento (mantido igual)
    useEffect(() => {
      const preloadImages = () => {
        const preloadLinks = [];
        [beforeImage, afterImage].forEach((src) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = src;
          link.as = 'image';
          link.fetchPriority = 'high';
          document.head.appendChild(link);
          preloadLinks.push(link);
        });
        return () => {
          preloadLinks.forEach(link => document.head.removeChild(link));
        };
      };
      preloadImages();
    }, [beforeImage, afterImage]);

    useEffect(() => {
      const timer = setTimeout(() => setShowInstruction(false), 3000);
      return () => clearTimeout(timer);
    }, []);

    const handleDragMove = useCallback((e) => {
      if (!isDragging || !containerRef.current) return;
      if (e.type.includes('touch')) {
        e.preventDefault();
      }
      setShowInstruction(false);
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const widthPercent = (x / rect.width) * 100;

      // Usar requestAnimationFrame para suavizar atualizações
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setSliderPosition(widthPercent);
      });
    }, [isDragging]);

    const handleMouseDown = useCallback(() => setIsDragging(true), []);
    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
      const moveHandler = (e) => handleDragMove(e);
      document.addEventListener('mousemove', moveHandler, { passive: true });
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleMouseUp);
        if (rafId.current) cancelAnimationFrame(rafId.current);
      };
    }, [handleDragMove, handleMouseUp]);

    const handleKeyDown = useCallback((e) => {
      if (e.key === 'ArrowLeft') {
        setSliderPosition((prev) => Math.max(prev - 5, 0));
        setShowInstruction(false);
      } else if (e.key === 'ArrowRight') {
        setSliderPosition((prev) => Math.min(prev + 5, 100));
        setShowInstruction(false);
      }
    }, []);

    return (
      <div
        className="before-after-container"
        ref={containerRef}
        role="region"
        aria-label={altText}
      >
        <img src={afterImage} alt={`Depois ${altText}`} className="after-image" />
        <img
          src={beforeImage}
          alt={`Antes ${altText}`}
          className="before-image"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        />
        <div
          className="slider"
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPosition)}
          aria-label="Controle de comparação"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onKeyDown={handleKeyDown}
        />
        {showInstruction && (
          <div className="slider-instruction" role="note">
            Arraste para comparar
          </div>
        )}
      </div>
    );
  });

  // Smooth scroll e fade-in
  useEffect(() => {
    const handleSmoothScroll = (e) => {
      e.preventDefault();
      const targetId = e.currentTarget.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener('click', handleSmoothScroll);
    });

    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );
    fadeElements.forEach((element) => observer.observe(element));

    return () => {
      anchors.forEach((anchor) => {
        anchor.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  // Manipulador de envio de formulário
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;
    const whatsappMessage = encodeURIComponent(`Olá, Dra. Samantha! Meu nome é ${name}, meu e-mail é ${email}. ${message}`);
    window.open(`https://wa.me/5589981333370?text=${whatsappMessage}`, '_blank');
    form.reset();
  };

  return (
    <div className="App">
      <header role="banner">
        <nav role="navigation" aria-label="Navegação principal">
          <a href="#inicio" className="logo">
            <span style={{ fontFamily: 'Missousy' }}>
              Dra. Samantha Oliveira Tavares
            </span>
          </a>
        </nav>
      </header>

      <section id="inicio" className="fade-in">
        <div className="logo-background"></div>
        <div className="logo-circle">
          <img
            src="/images/logo1.png"
            alt="Logo Dra. Samantha Oliveira Tavares"
            loading="lazy"
          />
        </div>
        <h1>Dra. Samantha Oliveira Tavares</h1>
        <p>Cirurgiã-Dentista | CRO/PI - 06846</p>
        <a
          href="https://wa.me/5589981333370"
          target="_blank"
          className="btn primary-btn"
          aria-label="Agendar consulta via WhatsApp"
        >
          Agendar Consulta
        </a>
        <a href="#procedimentos" className="btn" aria-label="Ver procedimentos oferecidos">
          Ver Procedimentos
        </a>
      </section>

      <section id="sobre" className="fade-in">
        <h2>Sobre</h2>
        <p>
          Sou Cirurgiã-Dentista apaixonada por transformar sorrisos com empatia, técnica e dedicação.
          Meu foco é proporcionar saúde oral e bem-estar, combinando estética e funcionalidade em São Raimundo Nonato, PI.
        </p>
        <ul className="sobre-list">
          <li>
            <FontAwesomeIcon icon={faTooth} />
            Dentística e Estética
          </li>
          <li>
            <FontAwesomeIcon icon={faTeeth} />
            Reabilitação Oral (Prótese)
          </li>
          <li>
            <FontAwesomeIcon icon={faTeethOpen} />
            Clareamento Dental
          </li>
          <li>
            <img
              src="/images/gengivas.png"
              alt="Ícone de gengiva"
              className="sobre-list-icon1"
              loading="lazy"
              
            />
            Tratamento de Gengivite e Periodontite
          </li>
        </ul>
        <div className="carousel" role="region" aria-label="Carrossel de imagens">
          {slides.map((slide, index) => (
            <img
              key={index}
              src={slide}
              alt={`Dra. Samantha ${index + 1}`}
              className={index === currentSlide ? 'active' : ''}
              loading={index <= currentSlide + 2 ? 'eager' : 'lazy'}
              sizes="(max-width: 600px) 480px, 800px"
            />
          ))}
          <div className="carousel-controls">
            <button onClick={prevSlide} aria-label="Imagem anterior">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button onClick={nextSlide} aria-label="Próxima imagem">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className="carousel-indicators">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => showSlide(index)}
                role="button"
                aria-label="Ir para a imagem ${index + 1}"
              />
            ))}
          </div>
        </div>
      </section>

      <section id="procedimentos" className="fade-in">
        <h2>Procedimentos</h2>
        <div className="procedimentos-grid">
          <div className="procedimento-card">
            <FontAwesomeIcon icon={faTooth} />
            <h3>Restaurações</h3>
            <p>Tratamento de cáries com materiais estéticos de alta qualidade.</p>
            <BeforeAfterSlider
              beforeImage="/images/1.png"
              afterImage="/images/2.png"
              altText="Comparação antes e depois de restaurações"
            />
            <a href="#contato" className="btn secondary-btn" aria-label="Saiba mais sobre restaurações">
              Saiba Mais
            </a>
          </div>
          <div className="procedimento-card">
            <FontAwesomeIcon icon={faTeethOpen} />
            <h3>Clareamento Dental</h3>
            <p>Realce a cor do seu sorriso com segurança e conforto.</p>
            <BeforeAfterSlider
              beforeImage="/images/3.png"
              afterImage="/images/4.png"
              altText="Comparação antes e depois de clareamento dental"
            />
            <a href="#contato" className="btn secondary-btn" aria-label="Saiba mais sobre clareamento dental">
              Saiba Mais
            </a>
          </div>
          <div className="procedimento-card">
            <img
              src="/images/gengivas.png"
              alt="Ícone de gengiva"
              className="sobre-list-icon"
              loading="lazy"
            />
            <h3>Limpeza Dental</h3>
            <p>Prevenção e cuidados para uma gengiva saudável.</p>
            <BeforeAfterSlider
              beforeImage="/images/5.png"
              afterImage="/images/6.png"
              altText="Comparação antes e depois de limpeza dental"
            />
            <a href="#contato" className="btn secondary-btn" aria-label="Saiba mais sobre limpeza dental">
              Saiba Mais
            </a>
          </div>
          <div className="procedimento-card">
            <FontAwesomeIcon icon={faTeeth} />
            <h3>Reabilitação Oral</h3>
            <p>Reconstrução do sorriso com próteses personalizadas.</p>
            <BeforeAfterSlider
              beforeImage="/images/7.png"
              afterImage="/images/8.png"
              altText="Comparação antes e depois de reabilitação oral"
            />
            <a href="#contato" className="btn secondary-btn" aria-label="Saiba mais sobre reabilitação oral">
              Saiba Mais
            </a>
          </div>
        </div>
      </section>

     <section id="localizacao" className="fade-in">
  <h2>Localização</h2>
  <p>
    <FontAwesomeIcon icon={faMapMarkerAlt} />{' '}
    MAIS SAÚDE - Rua Dr Barroso, 249, Aldeia, São Raimundo Nonato – PI
  </p>

  {/* Container do mapa */}
  <div
    style={{
      width: '100%',
      maxWidth: '800px',
      height: '400px',
      margin: '0 auto',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}
  >
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15880.66723833371!2d-42.6974333!3d-9.0167288!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x77a051dada60001%3A0xd5a78b96068de6c7!2sMais%20Sa%C3%BAde%20Centro%20Integrado!5e0!3m2!1spt-BR!2sbr!4v1717840000000!5m2!1spt-BR!2sbr"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Mapa da localização – Mais Saúde Centro Integrado"
    ></iframe>
  </div>

  {/* Botão de rota */}
  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
    <a
      href="https://www.google.com/maps/dir/?api=1&destination=-9.0167288,-42.6974333"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        backgroundColor: '#28a745',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
        display: 'inline-block',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
      }}
    >
      Ver rota no Google Maps
    </a>
  </div>
</section>


      <section id="contato" className="fade-in">
        <h2>Contato</h2>
        <form onSubmit={handleFormSubmit} className="contact-form">
          <input type="text" name="name" placeholder="Seu Nome" required aria-label="Nome" />
          <input type="email" name="email" placeholder="Seu E-mail" required aria-label="E-mail" />
          <textarea name="message" placeholder="Sua Mensagem" required aria-label="Mensagem" />
          <button type="submit" className="btn primary-btn" aria-label="Enviar mensagem via WhatsApp">
            Enviar via WhatsApp
          </button>
        </form>
        <div className="contato-links">
          <a href="https://wa.me/5589981333370" target="_blank" aria-label="Contato via WhatsApp">
            <FontAwesomeIcon icon={faWhatsapp} />
            WhatsApp: (89) 98133-3370
          </a>
          <a href="https://instagram.com" target="_blank" aria-label="Perfil no Instagram">
            <FontAwesomeIcon icon={faInstagram} />
            Instagram
          </a>
        </div>
        <a
          href="https://wa.me/5589981333370"
          target="_blank"
          className="btn primary-btn"
          aria-label="Agendar consulta agora pelo WhatsApp"
        >
          Agendar agora pelo WhatsApp
        </a>
      </section>

      <footer role="contentinfo">
        <p>Dra. Samantha Oliveira Tavares - Cirurgiã-Dentista | CRO/PI - 06846</p>
        <p className="logo">
          Dra. Samantha <br /> <span>Oliveira Tavares</span>
        </p>
        <p>Desenvolvido por Eita Devis</p>
      </footer>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dentist",
          "name": "Dra. Samantha Oliveira Tavares",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rua Dr Barroso, 249, Aldeia",
            "addressLocality": "São Raimundo Nonato",
            "addressRegion": "PI",
            "postalCode": ""
          },
          "telephone": "+5589981333370"
        })}
      </script>
    </div>
  );
}

export default App;