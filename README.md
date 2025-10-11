# Portfolio de Joaquin Berro

Plantilla premium de portfolio personal, con foco en estética moderna y contenido listo para personalizar.

## Estructura

- `index.html`: layout principal con secciones de hero, experiencia, proyectos, testimonios, blog y contacto.
- `styles/main.css`: sistema visual oscuro con gradientes, glassmorphism y diseño responsive.
- `scripts/main.js`: mejoras de UX como navegación flotante, scroll suave y carrusel de testimonios.
- `assets/`: carpeta para imágenes (usa `profile-placeholder.svg` como base) y futuros íconos.

## Uso

1. Abre `index.html` directamente en tu navegador para ver la versión estática.
2. Reemplaza textos ficticios y enlaces (`LinkedIn`, `GitHub`, `Blog →`, etc.) con tus datos reales.
3. Sustituye `assets/images/profile-placeholder.svg` por tu retrato y añade mockups reales en la sección de proyectos.
4. Ajusta la paleta o tipografías desde las variables definidas al inicio de `styles/main.css`.

> Tip: puedes convertir este template en un proyecto con build tooling (React, Astro, etc.) más adelante; la estructura semántica ya está pensada para escalar.

## Envío de mails con EmailJS

El formulario usa EmailJS para enviar mensajes sin backend y ya está configurado con:

- `service_id`: `service_dskmwot`
- `template_id`: `template_g5sb8ke`
- `public_key`: `UdfO-8kQlTVoS8y33`

Si deseas cambiarlos o regenerarlos:

1. Crea una cuenta gratuita en [EmailJS](https://www.emailjs.com/), agrega un servicio (por ejemplo Gmail) y un template.
2. Copia los valores `service_id`, `template_id` y `public_key`.
3. En `index.html`, reemplaza los atributos `data-emailjs-service`, `data-emailjs-template` y `data-emailjs-public-key` con tus nuevos valores.
4. Ajusta el template en EmailJS para mapear los campos `name`, `email`, `company`, `budget` y `message`.

> Si quitas o invalidas estas claves, el formulario seguirá siendo visible pero no enviará correos.

## Próximos pasos sugeridos

- Configurar EmailJS con tus claves reales (o conectar el formulario a otro backend) y probar el envío.
- Añadir métricas reales y testimonios verificados para reforzar credibilidad.
- Optimizar imágenes (WebP/AVIF) y generar favicon/og-images personalizados.
