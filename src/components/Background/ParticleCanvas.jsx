import { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;
  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    const u1 = {
      x: particle.velocity.x * Math.cos(angle) - particle.velocity.y * Math.sin(angle),
      y: particle.velocity.x * Math.sin(angle) + particle.velocity.y * Math.cos(angle)
    };
    const u2 = {
      x: otherParticle.velocity.x * Math.cos(angle) - otherParticle.velocity.y * Math.sin(angle),
      y: otherParticle.velocity.x * Math.sin(angle) + otherParticle.velocity.y * Math.cos(angle)
    };

    const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
    const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

    particle.velocity.x = v1.x * Math.cos(-angle) - v1.y * Math.sin(-angle);
    particle.velocity.y = v1.x * Math.sin(-angle) + v1.y * Math.cos(-angle);
    otherParticle.velocity.x = v2.x * Math.cos(-angle) - v2.y * Math.sin(-angle);
    otherParticle.velocity.y = v2.x * Math.sin(-angle) + v2.y * Math.cos(-angle);
  }
}

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const elementType = theme?.elementType || 'circle';

    class GiantElement {
      constructor(x, y, radius, type, color1, color2, vx, vy, rotationSpeed) {
        this.x = x;
        this.y = y;
        this.velocity = { x: vx, y: vy };
        this.radius = radius;
        this.mass = radius * 2;
        this.type = type;
        this.color1 = color1;
        this.color2 = color2;
        this.rotation = 0;
        this.rotationSpeed = rotationSpeed;
        this.phase = Math.random() * Math.PI * 2;
        this.breathOffset = 0;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Breathing effect
        const scale = 1 + this.breathOffset * 0.08;
        ctx.scale(scale, scale);

        // Gradient dengan opacity yang benar
        const gradient = ctx.createLinearGradient(
          -this.radius, -this.radius, 
          this.radius, this.radius
        );
        
        // 100% opacity di atas, 77% di bawah
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(0.5, this.color1);
        gradient.addColorStop(1, this.color2);
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = this.color1;
        ctx.shadowBlur = 30;

        ctx.beginPath();
        if (this.type === 'circle') {
          ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (this.type === 'star') {
          let rot = -Math.PI / 2;
          const step = Math.PI / 5;
          ctx.moveTo(0, -this.radius);
          for (let i = 0; i < 5; i++) {
            const x1 = Math.cos(rot) * this.radius;
            const y1 = Math.sin(rot) * this.radius;
            ctx.lineTo(x1, y1);
            rot += step;
            const x2 = Math.cos(rot) * this.radius * 0.4;
            const y2 = Math.sin(rot) * this.radius * 0.4;
            ctx.lineTo(x2, y2);
            rot += step;
          }
          ctx.closePath();
          ctx.fill();
        } 
        else if (this.type === 'heart') {
          const size = this.radius;
          ctx.moveTo(0, size * 0.3);
          ctx.bezierCurveTo(0, -size * 0.2, -size, -size * 0.1, -size, size * 0.3);
          ctx.bezierCurveTo(-size, size * 0.7, 0, size * 0.9, 0, size);
          ctx.bezierCurveTo(0, size * 0.9, size, size * 0.7, size, size * 0.3);
          ctx.bezierCurveTo(size, -size * 0.1, 0, -size * 0.2, 0, size * 0.3);
          ctx.fill();
        }
        ctx.restore();
      }

      update(allParticles, currentTime) {
        // Breathing effect
        this.breathOffset = Math.sin(currentTime * 1.2 + this.phase) * 0.3;
        this.rotation += this.rotationSpeed;
        this.draw();

        // Pantulan elastis
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
          this.velocity.x = -this.velocity.x * 0.99;
          this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
          this.velocity.y = -this.velocity.y * 0.99;
          this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }

        // Tabrakan dengan partikel lain
        for (let i = 0; i < allParticles.length; i++) {
          if (this === allParticles[i]) continue;
          
          const dx = this.x - allParticles[i].x;
          const dy = this.y - allParticles[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDist = this.radius + allParticles[i].radius;

          if (distance < minDist && distance > 0) {
            resolveCollision(this, allParticles[i]);
            
            const overlap = (minDist - distance) / 2;
            const nx = dx / distance;
            const ny = dy / distance;
            this.x += nx * overlap;
            this.y += ny * overlap;
            allParticles[i].x -= nx * overlap;
            allParticles[i].y -= ny * overlap;
          }
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;
      }
    }

    const initParticles = () => {
      particles = [];
      
      if (elementType === 'none') return;

      // Ukuran 20% dari sisi terkecil
      const size = Math.min(canvas.width, canvas.height) * 0.20;
      const maxSize = Math.min(canvas.width, canvas.height) * 0.25;
      const finalSize = Math.min(size, maxSize);
      
      const speed = 0.8;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Posisi start dari ujung pojok
      const start1X = canvas.width * 0.05 + finalSize;
      const start1Y = canvas.height * 0.05 + finalSize;
      const angle1 = Math.atan2(centerY - start1Y, centerX - start1X);
      const vx1 = Math.cos(angle1) * speed;
      const vy1 = Math.sin(angle1) * speed;

      const start2X = canvas.width * 0.95 - finalSize;
      const start2Y = canvas.height * 0.95 - finalSize;
      const angle2 = Math.atan2(centerY - start2Y, centerX - start2X);
      const vx2 = Math.cos(angle2) * speed;
      const vy2 = Math.sin(angle2) * speed;

      const rotSpeed1 = 0.003;
      const rotSpeed2 = -0.003;

      // DEFINISIKAN WARNA UNTUK SETIAP SHAPE
      let colorSets = [];
      
      if (elementType === 'circle') {
        colorSets = [
          { c1: 'rgba(108, 92, 231, 1)', c2: 'rgba(108, 92, 231, 0.77)' },    // Ungu
          { c1: 'rgba(0, 206, 201, 1)', c2: 'rgba(0, 206, 201, 0.77)' }        // Turquoise
        ];
      } 
      else if (elementType === 'heart') {
        colorSets = [
          { c1: 'rgba(255, 107, 107, 1)', c2: 'rgba(255, 107, 107, 0.77)' },  // Merah
          { c1: 'rgba(255, 71, 87, 1)', c2: 'rgba(255, 71, 87, 0.77)' }       // Merah Tua
        ];
      } 
      else if (elementType === 'star') {
        colorSets = [
          { c1: 'rgba(255, 230, 109, 1)', c2: 'rgba(255, 230, 109, 0.77)' },  // Kuning
          { c1: 'rgba(255, 159, 67, 1)', c2: 'rgba(255, 159, 67, 0.77)' }     // Orange
        ];
      } 
      else {
        // Default
        colorSets = [
          { c1: 'rgba(108, 92, 231, 1)', c2: 'rgba(108, 92, 231, 0.77)' },
          { c1: 'rgba(0, 206, 201, 1)', c2: 'rgba(0, 206, 201, 0.77)' }
        ];
      }

      // Pastikan ada 2 set warna
      if (colorSets.length < 2) {
        colorSets = [
          { c1: 'rgba(108, 92, 231, 1)', c2: 'rgba(108, 92, 231, 0.77)' },
          { c1: 'rgba(0, 206, 201, 1)', c2: 'rgba(0, 206, 201, 0.77)' }
        ];
      }

      // ELEMEN 1 dengan warna pertama
      particles.push(
        new GiantElement(
          start1X, start1Y, finalSize, elementType,
          colorSets[0].c1, colorSets[0].c2,
          vx1, vy1, rotSpeed1
        )
      );
      
      // ELEMEN 2 dengan warna kedua yang BERBEDA
      particles.push(
        new GiantElement(
          start2X, start2Y, finalSize, elementType,
          colorSets[1].c1, colorSets[1].c2,
          vx2, vy2, rotSpeed2
        )
      );

      console.log(`Shape: ${elementType}, Warna 1: ${colorSets[0].c1}, Warna 2: ${colorSets[1].c1}`);
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.016;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => p.update(particles, time));
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [theme?.elementType]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ 
        display: 'block',
        background: 'transparent'
      }}
    />
  );
}

export default ParticleCanvas;