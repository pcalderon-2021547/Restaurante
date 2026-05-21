import React from 'react';
import ReactDOMServer from 'react-dom/server';

const BRAND = {
  background: '#0a0906',
  panel: '#141210',
  accent: '#c9a84c',
  subtle: '#1c1a16',
  text: '#f0e8d5',
  muted: '#9a8e74',
  border: 'rgba(201,168,76,0.18)',
  footer: '#7a6e54'
};

const createParagraphs = (paragraphs = []) =>
  paragraphs.map((text, index) =>
    React.createElement(
      'p',
      {
        key: index,
        style: {
          margin: '0 0 18px',
          color: BRAND.text,
          fontSize: '15px',
          lineHeight: '1.75'
        }
      },
      text
    )
  );

const EmailTemplate = ({ title, preheader, heading, intro, paragraphs, bodyHtml, buttonText, buttonUrl, fallbackText, fallbackUrl, notice }) =>
  React.createElement(
    'html',
    { lang: 'es' },
    React.createElement(
      'head',
      null,
      React.createElement('meta', { charSet: 'UTF-8' }),
      React.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }),
      React.createElement('title', null, title)
    ),
    React.createElement(
      'body',
      {
        style: {
          margin: 0,
          padding: 0,
          backgroundColor: BRAND.background,
          color: BRAND.text,
          fontFamily: "'DM Sans', Arial, sans-serif",
          lineHeight: 1.6
        }
      },
      React.createElement('div', { style: { display: 'none', fontSize: '1px', color: BRAND.background, lineHeight: 0, maxHeight: '0', maxWidth: '0', opacity: 0, overflow: 'hidden' } }, preheader),
      React.createElement(
        'div',
        { style: { width: '100%', minHeight: '100vh', padding: '32px 16px', backgroundColor: BRAND.background } },
        React.createElement(
          'table',
          { width: '100%', cellPadding: '0', cellSpacing: '0', style: { maxWidth: '640px', margin: '0 auto', borderCollapse: 'collapse' } },
          React.createElement(
            'tbody',
            null,
            React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                null,
                React.createElement(
                  'div',
                  {
                    style: {
                      borderRadius: '28px',
                      overflow: 'hidden',
                      border: `1px solid ${BRAND.border}`,
                      boxShadow: '0 28px 80px rgba(0,0,0,0.22)'
                    }
                  },
                  React.createElement(
                    'div',
                    {
                      style: {
                        background: 'linear-gradient(135deg, #191614 0%, #241d14 45%, #2f2416 100%)',
                        padding: '28px 26px',
                        textAlign: 'center'
                      }
                    },
                    React.createElement(
                      'div',
                      {
                        style: {
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '14px'
                        }
                      },
                      React.createElement(
                        'div',
                        {
                          style: {
                            width: '52px',
                            height: '52px',
                            borderRadius: '18px',
                            border: `1px solid ${BRAND.accent}`,
                            display: 'grid',
                            placeItems: 'center',
                            backgroundColor: 'rgba(201,168,76,0.14)'
                          }
                        },
                        React.createElement('span', { style: { fontSize: '22px' } }, '🍽️')
                      ),
                      React.createElement(
                        'div',
                        { style: { textAlign: 'left' } },
                        React.createElement('div', { style: { color: BRAND.accent, fontSize: '18px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' } }, 'Gestión Restaurante'),
                        React.createElement('div', { style: { color: BRAND.muted, fontSize: '12px', marginTop: '6px' } }, 'Diseño, sabor y control en cada correo')
                      )
                    )
                  )
                )
              )
            ),
            React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                { style: { padding: '34px 32px 32px', backgroundColor: BRAND.panel } },
                React.createElement('h1', { style: { margin: 0, color: BRAND.text, fontSize: '30px', fontWeight: 700, lineHeight: '1.1', fontFamily: "'Cormorant Garamond', Georgia, serif" } }, heading),
                React.createElement('p', { style: { margin: '22px 0 0', color: BRAND.muted, fontSize: '15px', lineHeight: '1.9' } }, intro),
                bodyHtml ? React.createElement('div', { dangerouslySetInnerHTML: { __html: bodyHtml }, style: { marginTop: '24px', color: BRAND.text, fontSize: '15px', lineHeight: '1.75' } }) : createParagraphs(paragraphs),
                buttonText && buttonUrl && React.createElement(
                  'div',
                  { style: { marginTop: '30px', textAlign: 'center' } },
                  React.createElement(
                    'a',
                    {
                      href: buttonUrl,
                      style: {
                        display: 'inline-block',
                        padding: '16px 26px',
                        backgroundColor: BRAND.accent,
                        color: '#0a0906',
                        textDecoration: 'none',
                        fontWeight: 700,
                        borderRadius: '14px',
                        minWidth: '220px',
                        letterSpacing: '0.04em'
                      },
                      target: '_blank',
                      rel: 'noopener noreferrer'
                    },
                    buttonText
                  )
                ),
                fallbackText && fallbackUrl && React.createElement(
                  'div',
                  { style: { marginTop: '26px', padding: '22px', backgroundColor: '#16120f', borderRadius: '16px', border: `1px solid rgba(255,255,255,0.06)` } },
                  React.createElement('p', { style: { margin: 0, color: BRAND.text, fontSize: '14px', lineHeight: '1.75' } }, fallbackText),
                  React.createElement('a', { href: fallbackUrl, style: { display: 'inline-block', marginTop: '10px', color: BRAND.accent, fontSize: '14px', wordBreak: 'break-all' }, target: '_blank', rel: 'noopener noreferrer' }, fallbackUrl)
                ),
                notice && React.createElement(
                  'div',
                  { style: { marginTop: '26px', padding: '18px', backgroundColor: '#090705', borderRadius: '14px', border: `1px solid ${BRAND.border}` } },
                  React.createElement('p', { style: { margin: 0, color: BRAND.muted, fontSize: '13px', lineHeight: '1.75' } }, notice)
                )
              )
            ),
            React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                { style: { padding: '0 32px 30px', backgroundColor: BRAND.panel } },
                React.createElement('div', { style: { height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '0 0 24px' } }),
                React.createElement('p', { style: { margin: 0, color: BRAND.footer, fontSize: '12px', lineHeight: '1.7' } }, 'Este correo fue enviado automáticamente por Gestión Restaurante. Por favor no respondas a este mensaje.'),
                React.createElement('p', { style: { margin: '10px 0 0', color: BRAND.footer, fontSize: '12px', lineHeight: '1.7' } }, `© ${new Date().getFullYear()} Gestión Restaurante`)
              )
            )
          )
        )
      )
    )
  );

export const renderEmailTemplate = (props) => `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(React.createElement(EmailTemplate, props))}`;
