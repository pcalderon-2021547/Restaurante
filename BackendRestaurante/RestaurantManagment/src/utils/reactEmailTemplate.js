import React from 'react';
import ReactDOMServer from 'react-dom/server';

const BRAND = {
  page: '#120d0a',
  ink: '#f8efe0',
  muted: '#bcae98',
  soft: '#ead9bd',
  card: '#211812',
  cardAlt: '#2b1e16',
  wine: '#6f1d1b',
  wineDark: '#43110f',
  gold: '#d9aa55',
  olive: '#8a8f55',
  border: '#4a3324',
  line: 'rgba(217,170,85,0.38)'
};

const MOJIBAKE_REPLACEMENTS = [
  ['Ã¡', 'á'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['Ã±', 'ñ'],
  ['Ã', 'Á'],
  ['Ã‰', 'É'],
  ['Ã', 'Í'],
  ['Ã“', 'Ó'],
  ['Ãš', 'Ú'],
  ['Ã‘', 'Ñ'],
  ['â€”', '-'],
  ['â€“', '-'],
  ['Â©', '©'],
  ['Â¡', '¡'],
  ['Â¿', '¿']
];

const repairText = (value) => {
  if (typeof value !== 'string') return value;
  return MOJIBAKE_REPLACEMENTS.reduce((current, [bad, good]) => current.replaceAll(bad, good), value);
};

const text = (value, fallback = '') => repairText(value == null || value === '' ? fallback : value);

const createParagraphs = (paragraphs = []) =>
  paragraphs.map((paragraph, index) =>
    React.createElement(
      'p',
      {
        key: index,
        style: {
          margin: '0 0 16px',
          color: BRAND.soft,
          fontSize: '15px',
          lineHeight: '1.75'
        }
      },
      text(paragraph)
    )
  );

const DetailPill = ({ label, value }) =>
  React.createElement(
    'td',
    {
      style: {
        padding: '0 6px 10px 0',
        verticalAlign: 'top'
      }
    },
    React.createElement(
      'div',
      {
        style: {
          border: `1px solid ${BRAND.border}`,
          backgroundColor: '#1a120d',
          borderRadius: '8px',
          padding: '12px 14px'
        }
      },
      React.createElement(
        'div',
        {
          style: {
            color: BRAND.gold,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginBottom: '5px'
          }
        },
        text(label)
      ),
      React.createElement(
        'div',
        {
          style: {
            color: BRAND.ink,
            fontSize: '14px',
            lineHeight: '1.45',
            fontWeight: 600
          }
        },
        text(value)
      )
    )
  );

const DetailsTable = ({ items = [] }) => {
  if (!items.length) return null;

  return React.createElement(
    'table',
    {
      width: '100%',
      cellPadding: '0',
      cellSpacing: '0',
      role: 'presentation',
      style: { marginTop: '22px', borderCollapse: 'collapse' }
    },
    React.createElement(
      'tbody',
      null,
      items.map((item, index) =>
        React.createElement(
          'tr',
          { key: index },
          React.createElement(DetailPill, {
            label: item.label,
            value: item.value
          })
        )
      )
    )
  );
};

const EmailTemplate = ({
  title,
  preheader,
  heading,
  intro,
  paragraphs,
  bodyHtml,
  buttonText,
  buttonUrl,
  fallbackText,
  fallbackUrl,
  notice,
  details = []
}) =>
  React.createElement(
    'html',
    { lang: 'es' },
    React.createElement(
      'head',
      null,
      React.createElement('meta', { charSet: 'UTF-8' }),
      React.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }),
      React.createElement('title', null, text(title, 'Gestion Restaurante'))
    ),
    React.createElement(
      'body',
      {
        style: {
          margin: 0,
          padding: 0,
          backgroundColor: BRAND.page,
          color: BRAND.ink,
          fontFamily: "Georgia, 'Times New Roman', serif"
        }
      },
      React.createElement(
        'div',
        {
          style: {
            display: 'none',
            fontSize: '1px',
            color: BRAND.page,
            lineHeight: 0,
            maxHeight: '0',
            maxWidth: '0',
            opacity: 0,
            overflow: 'hidden'
          }
        },
        text(preheader, title)
      ),
      React.createElement(
        'table',
        {
          width: '100%',
          cellPadding: '0',
          cellSpacing: '0',
          role: 'presentation',
          style: {
            width: '100%',
            backgroundColor: BRAND.page,
            borderCollapse: 'collapse'
          }
        },
        React.createElement(
          'tbody',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement(
              'td',
              { align: 'center', style: { padding: '34px 14px' } },
              React.createElement(
                'table',
                {
                  width: '100%',
                  cellPadding: '0',
                  cellSpacing: '0',
                  role: 'presentation',
                  style: {
                    maxWidth: '660px',
                    borderCollapse: 'collapse',
                    border: `1px solid ${BRAND.border}`,
                    backgroundColor: BRAND.card
                  }
                },
                React.createElement(
                  'tbody',
                  null,
                  React.createElement(
                    'tr',
                    null,
                    React.createElement(
                      'td',
                      {
                        style: {
                          backgroundColor: BRAND.wineDark,
                          borderTop: `5px solid ${BRAND.gold}`,
                          borderBottom: `1px solid ${BRAND.line}`,
                          padding: '26px 30px 22px'
                        }
                      },
                      React.createElement(
                        'table',
                        { width: '100%', cellPadding: '0', cellSpacing: '0', role: 'presentation' },
                        React.createElement(
                          'tbody',
                          null,
                          React.createElement(
                            'tr',
                            null,
                            React.createElement(
                              'td',
                              {
                                width: '72',
                                style: {
                                  verticalAlign: 'middle'
                                }
                              },
                              React.createElement(
                                'div',
                                {
                                  style: {
                                    width: '58px',
                                    height: '58px',
                                    border: `1px solid ${BRAND.gold}`,
                                    backgroundColor: BRAND.wine,
                                    borderRadius: '50%',
                                    textAlign: 'center',
                                    lineHeight: '58px',
                                    color: BRAND.gold,
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '18px',
                                    fontWeight: 800,
                                    letterSpacing: '1px'
                                  }
                                },
                                'GR'
                              )
                            ),
                            React.createElement(
                              'td',
                              { style: { verticalAlign: 'middle' } },
                              React.createElement(
                                'div',
                                {
                                  style: {
                                    color: BRAND.gold,
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    letterSpacing: '2.4px',
                                    textTransform: 'uppercase'
                                  }
                                },
                                'Gestion Restaurante'
                              ),
                              React.createElement(
                                'div',
                                {
                                  style: {
                                    color: BRAND.ink,
                                    fontSize: '24px',
                                    lineHeight: '1.15',
                                    marginTop: '5px',
                                    fontWeight: 700
                                  }
                                },
                                'Mesa, cocina y servicio en orden'
                              ),
                              React.createElement(
                                'div',
                                {
                                  style: {
                                    color: BRAND.muted,
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '12px',
                                    lineHeight: '1.55',
                                    marginTop: '7px'
                                  }
                                },
                                'Notificaciones con el cuidado de una buena experiencia gastronomica.'
                              )
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
                      {
                        style: {
                          padding: '30px',
                          backgroundColor: BRAND.card
                        }
                      },
                      React.createElement(
                        'div',
                        {
                          style: {
                            color: BRAND.gold,
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '1.9px',
                            textTransform: 'uppercase',
                            marginBottom: '10px'
                          }
                        },
                        'Servicio del restaurante'
                      ),
                      React.createElement(
                        'h1',
                        {
                          style: {
                            margin: 0,
                            color: BRAND.ink,
                            fontSize: '31px',
                            lineHeight: '1.16',
                            fontWeight: 700
                          }
                        },
                        text(heading, title)
                      ),
                      intro &&
                        React.createElement(
                          'p',
                          {
                            style: {
                              margin: '16px 0 0',
                              color: BRAND.muted,
                              fontFamily: 'Arial, sans-serif',
                              fontSize: '15px',
                              lineHeight: '1.75'
                            }
                          },
                          text(intro)
                        ),
                      React.createElement(
                        'div',
                        {
                          style: {
                            height: '1px',
                            backgroundColor: BRAND.line,
                            margin: '24px 0'
                          }
                        }
                      ),
                      bodyHtml
                        ? React.createElement('div', {
                            dangerouslySetInnerHTML: { __html: bodyHtml },
                            style: {
                              color: BRAND.soft,
                              fontFamily: 'Arial, sans-serif',
                              fontSize: '15px',
                              lineHeight: '1.75'
                            }
                          })
                        : React.createElement(
                            'div',
                            { style: { fontFamily: 'Arial, sans-serif' } },
                            createParagraphs(paragraphs)
                          ),
                      React.createElement(DetailsTable, { items: details }),
                      buttonText &&
                        buttonUrl &&
                        React.createElement(
                          'table',
                          {
                            width: '100%',
                            cellPadding: '0',
                            cellSpacing: '0',
                            role: 'presentation',
                            style: { marginTop: '30px', borderCollapse: 'collapse' }
                          },
                          React.createElement(
                            'tbody',
                            null,
                            React.createElement(
                              'tr',
                              null,
                              React.createElement(
                                'td',
                                { align: 'center' },
                                React.createElement(
                                  'a',
                                  {
                                    href: buttonUrl,
                                    target: '_blank',
                                    rel: 'noopener noreferrer',
                                    style: {
                                      display: 'inline-block',
                                      backgroundColor: BRAND.gold,
                                      color: '#1c120d',
                                      fontFamily: 'Arial, sans-serif',
                                      fontSize: '14px',
                                      fontWeight: 800,
                                      letterSpacing: '0.5px',
                                      textDecoration: 'none',
                                      borderRadius: '8px',
                                      padding: '15px 26px',
                                      minWidth: '210px',
                                      textAlign: 'center',
                                      border: '1px solid #f1cc83'
                                    }
                                  },
                    text(buttonText)
                                )
                              )
                            )
                          )
                        ),
                      fallbackText &&
                        fallbackUrl &&
                        React.createElement(
                          'div',
                          {
                            style: {
                              marginTop: '24px',
                              padding: '17px 18px',
                              backgroundColor: BRAND.cardAlt,
                              border: `1px solid ${BRAND.border}`,
                              borderRadius: '8px',
                              fontFamily: 'Arial, sans-serif'
                            }
                          },
                          React.createElement(
                            'p',
                            {
                              style: {
                                margin: 0,
                                color: BRAND.muted,
                                fontSize: '13px',
                                lineHeight: '1.65'
                              }
                            },
                            text(fallbackText)
                          ),
                          React.createElement(
                            'a',
                            {
                              href: fallbackUrl,
                              target: '_blank',
                              rel: 'noopener noreferrer',
                              style: {
                                display: 'block',
                                marginTop: '9px',
                                color: BRAND.gold,
                                fontSize: '13px',
                                lineHeight: '1.55',
                                wordBreak: 'break-all'
                              }
                            },
                            text(fallbackUrl)
                          )
                        ),
                      notice &&
                        React.createElement(
                          'div',
                          {
                            style: {
                              marginTop: '22px',
                              padding: '15px 16px',
                              backgroundColor: '#19110d',
                              borderLeft: `4px solid ${BRAND.olive}`,
                              fontFamily: 'Arial, sans-serif'
                            }
                          },
                          React.createElement(
                            'p',
                            {
                              style: {
                                margin: 0,
                                color: BRAND.muted,
                                fontSize: '13px',
                                lineHeight: '1.7'
                              }
                            },
                            text(notice)
                          )
                        )
                    )
                  ),
                  React.createElement(
                    'tr',
                    null,
                    React.createElement(
                      'td',
                      {
                        style: {
                          padding: '22px 30px 26px',
                          backgroundColor: '#17100c',
                          borderTop: `1px solid ${BRAND.line}`,
                          fontFamily: 'Arial, sans-serif'
                        }
                      },
                      React.createElement(
                        'p',
                        {
                          style: {
                            margin: 0,
                            color: BRAND.muted,
                            fontSize: '12px',
                            lineHeight: '1.65'
                          }
                        },
                        'Correo automatico de Gestion Restaurante. Por favor no respondas a este mensaje.'
                      ),
                      React.createElement(
                        'p',
                        {
                          style: {
                            margin: '8px 0 0',
                            color: '#8d7b65',
                            fontSize: '12px',
                            lineHeight: '1.65'
                          }
                        },
                        `Carta digital, reservaciones, pedidos y reportes. ${new Date().getFullYear()}.`
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );

export const renderEmailTemplate = (props) =>
  `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(React.createElement(EmailTemplate, props))}`;
