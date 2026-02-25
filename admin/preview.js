/**
 * Decap CMS Preview Templates — Gamma Omicron Alumni Association
 *
 * Each template mirrors the exact HTML/CSS used on the live site so admins
 * see a pixel-perfect preview of their content before publishing.
 *
 * Usage: loaded by admin/index.html after decap-cms.js
 */

(function () {
  /* ── inject site stylesheet into ALL preview panes ───────────────── */
  CMS.registerPreviewStyle('/site.css');

  /* ── inject preview-specific helpers into all panes ─────────────── */
  CMS.registerPreviewStyle([
    '@import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400;1,600&display=swap");',
    ':root{--garnet:#8B1A2E;--garnet-dark:#5C0F1C;--garnet-deep:#3D0910;',
    '--gold:#C9A84C;--gold-light:#E8C96A;--cream:#FAF6EE;--ink:#1A1009;}',
    'body{margin:0;padding:0;background:#FAF6EE;}',
    /* context bar shown at top of every preview */
    '.cms-preview-bar{background:var(--garnet-dark);color:var(--gold);',
    'font-family:"Josefin Sans",sans-serif;font-size:10px;font-weight:700;',
    'letter-spacing:.25em;text-transform:uppercase;padding:8px 16px;',
    'border-bottom:2px solid var(--gold);display:flex;align-items:center;gap:8px;}',
    '.cms-preview-bar span{opacity:.6;font-weight:400;}',
    '.cms-preview-scroll{padding:32px 24px;}'
  ].join(''), { raw: true });

  var h = window.h;

  /* ── utility ──────────────────────────────────────────────────────── */
  function g(entry) { return entry.getIn(['data']); }
  function gf(entry, field) { var v = entry.getIn(['data', field]); return v || ''; }
  function gl(entry, field) { var v = entry.getIn(['data', field]); return v ? v.toJS() : []; }

  function previewBar(title, subtitle) {
    return h('div', { className: 'cms-preview-bar' },
      '📄 PREVIEW — ', h('strong', null, title),
      subtitle ? h('span', null, ' · ' + subtitle) : null
    );
  }

  function emptyState(msg) {
    return h('div', {
      style: {
        textAlign: 'center', padding: '48px 24px',
        color: '#999', fontFamily: '"Josefin Sans",sans-serif', fontSize: '13px'
      }
    }, msg);
  }

  /* ══════════════════════════════════════════════════════════════════
   * 📰 NEWS POSTS PREVIEW
   * Shows cards exactly as they appear on /news.html
   * ══════════════════════════════════════════════════════════════════ */
  var NewsPreview = createClass({
    render: function () {
      var posts = gl(this.props.entry, 'posts').filter(function (p) { return p.published !== false; });
      return h('div', null,
        previewBar('Chapter News', '/news.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '24px' } },
            h('span', { className: 'section-eyebrow' }, 'Latest Updates'),
            h('h2', { className: 'section-title' }, 'Chapter ', h('em', null, 'News')),
            h('div', { className: 'section-rule' })
          ),
          posts.length === 0
            ? emptyState('No published posts yet — add posts using the list on the left.')
            : h('div', { className: 'news-grid' },
                posts.slice(0, 6).map(function (post, i) {
                  return h('div', { key: i, className: 'news-card' },
                    h('div', { className: 'news-card-date' }, post.date || ''),
                    h('h3', { className: 'news-card-title' }, post.title || '(No title)'),
                    h('p', { className: 'news-card-excerpt' }, post.excerpt || ''),
                    h('span', { className: 'news-card-tag' }, post.category || '')
                  );
                })
              )
        )
      );
    }
  });
  CMS.registerPreviewTemplate('news', NewsPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 📅 EVENTS PREVIEW
   * Shows event rows as they appear in the popup on /calendar.html
   * ══════════════════════════════════════════════════════════════════ */
  var EventsPreview = createClass({
    render: function () {
      var events = gl(this.props.entry, 'events').filter(function (e) { return e.published !== false; });
      return h('div', null,
        previewBar('Events & Calendar', '/calendar.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '24px' } },
            h('span', { className: 'section-eyebrow' }, 'Upcoming Events'),
            h('h2', { className: 'section-title' }, 'Event ', h('em', null, 'Calendar')),
            h('div', { className: 'section-rule' })
          ),
          events.length === 0
            ? emptyState('No events yet — add events using the list on the left.')
            : h('div', { className: 'events-list' },
                events.map(function (ev, i) {
                  return h('div', { key: i, className: 'event-row' },
                    h('div', { className: 'event-date-badge' },
                      h('span', { className: 'event-month' }, ev.month_short || '—'),
                      h('span', { className: 'event-day' }, ev.day || '—')
                    ),
                    h('div', { className: 'event-details' },
                      h('div', { className: 'event-title' }, ev.title || '(No title)'),
                      h('div', { className: 'event-meta' },
                        h('span', null, ev.location || ''),
                        ev.time ? h('span', null, ' · ' + ev.time) : null,
                        ev.notes ? h('span', null, ' · ' + ev.notes) : null
                      )
                    ),
                    ev.rsvp_link
                      ? h('a', { className: 'btn-primary', href: ev.rsvp_link, style: { fontSize: '12px', padding: '6px 14px' } }, 'RSVP')
                      : null
                  );
                })
              ),
          /* ── How the calendar popup looks ── */
          events.length > 0
            ? h('div', { style: { marginTop: '40px' } },
                h('div', { className: 'section-header', style: { marginBottom: '16px' } },
                  h('span', { className: 'section-eyebrow' }, 'Calendar Popup Preview'),
                  h('p', { style: { fontSize: '12px', color: '#666', margin: '4px 0 0', fontFamily: '"Josefin Sans",sans-serif' } },
                    'When a visitor clicks a red date on the calendar, this popup appears:'
                  )
                ),
                h('div', {
                  style: {
                    border: '2px solid #8B1A2E', borderRadius: '8px', overflow: 'hidden',
                    maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,.15)'
                  }
                },
                  h('div', {
                    style: {
                      background: '#5C0F1C', color: '#C9A84C', padding: '16px 20px',
                      fontFamily: '"Josefin Sans",sans-serif', fontSize: '11px',
                      letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700
                    }
                  }, '📅 Event Details'),
                  h('div', { style: { padding: '20px', background: '#fff' } },
                    (function () {
                      var ev = events[0];
                      return [
                        h('h3', {
                          key: 't', style: { margin: '0 0 12px', fontSize: '20px', color: '#3D0910', fontFamily: '"Playfair Display",serif' }
                        }, ev.title),
                        h('table', { key: 'tb', style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: '"Josefin Sans",sans-serif' } },
                          h('tbody', null,
                            h('tr', { key: 'd' },
                              h('td', { style: { color: '#8B1A2E', fontWeight: 700, padding: '4px 12px 4px 0', whiteSpace: 'nowrap' } }, 'DATE'),
                              h('td', { style: { color: '#1A1009' } }, ev.month_short + ' ' + ev.day + ', ' + ev.year)
                            ),
                            h('tr', { key: 'l' },
                              h('td', { style: { color: '#8B1A2E', fontWeight: 700, padding: '4px 12px 4px 0' } }, 'WHERE'),
                              h('td', { style: { color: '#1A1009' } }, ev.location)
                            ),
                            ev.time ? h('tr', { key: 'ti' },
                              h('td', { style: { color: '#8B1A2E', fontWeight: 700, padding: '4px 12px 4px 0' } }, 'TIME'),
                              h('td', { style: { color: '#1A1009' } }, ev.time)
                            ) : null,
                            ev.notes ? h('tr', { key: 'n' },
                              h('td', { style: { color: '#8B1A2E', fontWeight: 700, padding: '4px 12px 4px 0' } }, 'NOTES'),
                              h('td', { style: { color: '#1A1009' } }, ev.notes)
                            ) : null
                          )
                        ),
                        ev.rsvp_link ? h('a', {
                          key: 'r', href: '#',
                          style: {
                            display: 'inline-block', marginTop: '16px', background: '#8B1A2E', color: '#fff',
                            padding: '10px 24px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.15em',
                            textTransform: 'uppercase', fontFamily: '"Josefin Sans",sans-serif', textDecoration: 'none'
                          }
                        }, 'RSVP / Register →') : null
                      ];
                    })()
                  )
                )
              )
            : null
        )
      );
    }
  });
  CMS.registerPreviewTemplate('events', EventsPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 📸 ACTIVE CHAPTER COMPOSITE PHOTO PREVIEW
   * Shows the composite photo frame as it appears on /active-chapter.html
   * ══════════════════════════════════════════════════════════════════ */
  var CompositePreview = createClass({
    render: function () {
      var d = g(this.props.entry);
      var photo = d ? d.get('photo_url') : '';
      var year = d ? d.get('year_label') : '';
      var caption = d ? d.get('caption') : '';
      var photographer = d ? d.get('photographer') : '';
      return h('div', null,
        previewBar('Chapter Composite Photo', '/active-chapter.html'),
        h('div', {
          style: {
            background: 'linear-gradient(135deg,#3D0910 0%,#5C0F1C 60%,#7A1525 100%)',
            minHeight: '60vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '40px 24px'
          }
        },
          year ? h('p', {
            style: {
              color: '#C9A84C', fontFamily: '"Josefin Sans",sans-serif', fontSize: '11px',
              letterSpacing: '.3em', textTransform: 'uppercase', margin: '0 0 16px'
            }
          }, year) : null,
          photo
            ? h('div', {
                style: {
                  border: '6px solid #C9A84C', borderRadius: '4px', overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,.6)', maxWidth: '860px', width: '100%'
                }
              },
                h('img', { src: photo, alt: 'Chapter Composite', style: { width: '100%', display: 'block' } })
              )
            : h('div', {
                style: {
                  border: '6px dashed rgba(201,168,76,.4)', borderRadius: '4px',
                  width: '80%', maxWidth: '600px', aspectRatio: '4/3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(201,168,76,.5)', fontFamily: '"Josefin Sans",sans-serif',
                  fontSize: '13px', letterSpacing: '.1em'
                }
              }, '📷 Upload a photo to see it here'),
          caption ? h('p', {
            style: {
              color: 'rgba(255,255,255,.7)', fontFamily: '"Josefin Sans",sans-serif',
              fontSize: '12px', marginTop: '16px', letterSpacing: '.08em'
            }
          }, caption) : null,
          photographer ? h('p', {
            style: {
              color: 'rgba(201,168,76,.5)', fontFamily: '"Josefin Sans",sans-serif',
              fontSize: '10px', margin: '4px 0 0', letterSpacing: '.1em', textTransform: 'uppercase'
            }
          }, 'Photo: ' + photographer) : null
        )
      );
    }
  });
  CMS.registerPreviewTemplate('active_chapter_photo', CompositePreview);

  /* ══════════════════════════════════════════════════════════════════
   * 🏛️ EXECUTIVE BOARD PREVIEW
   * Shows the board widget as it appears on /chapter.html
   * ══════════════════════════════════════════════════════════════════ */
  var ExecBoardPreview = createClass({
    render: function () {
      var year = gf(this.props.entry, 'year');
      var officers = gl(this.props.entry, 'officers');
      return h('div', null,
        previewBar('Executive Board', '/chapter.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', {
            style: {
              background: 'linear-gradient(135deg,#3D0910,#5C0F1C)',
              borderRadius: '8px', overflow: 'hidden', maxWidth: '600px'
            }
          },
            h('div', {
              style: {
                background: 'rgba(201,168,76,.12)', borderBottom: '1px solid rgba(201,168,76,.3)',
                padding: '16px 24px',
                fontFamily: '"Josefin Sans",sans-serif', fontSize: '11px',
                letterSpacing: '.25em', textTransform: 'uppercase',
                color: '#C9A84C', fontWeight: 700
              }
            }, '🏛️ Executive Board ' + (year || '')),
            officers.length === 0
              ? h('div', { style: { padding: '24px', color: 'rgba(255,255,255,.4)', fontFamily: '"Josefin Sans",sans-serif', fontSize: '12px' } },
                  'Add officers using the list on the left.')
              : h('table', { style: { width: '100%', borderCollapse: 'collapse' } },
                  h('tbody', null,
                    officers.map(function (o, i) {
                      return h('tr', { key: i, style: { borderBottom: '1px solid rgba(255,255,255,.07)' } },
                        h('td', {
                          style: {
                            padding: '10px 24px', color: 'rgba(201,168,76,.8)',
                            fontFamily: '"Josefin Sans",sans-serif', fontSize: '11px',
                            letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap'
                          }
                        }, o.position || ''),
                        h('td', {
                          style: {
                            padding: '10px 24px', color: 'rgba(255,255,255,.85)',
                            fontFamily: '"Josefin Sans",sans-serif', fontSize: '14px'
                          }
                        }, o.name || '')
                      );
                    })
                  )
                )
          )
        )
      );
    }
  });
  CMS.registerPreviewTemplate('exec_board', ExecBoardPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 🎓 SCHOLARSHIPS PREVIEW
   * Shows scholarship card as it appears on /scholarships.html
   * ══════════════════════════════════════════════════════════════════ */
  var ScholarshipPreview = createClass({
    render: function () {
      var d = g(this.props.entry);
      var name = d ? (d.get('name') || '(Scholarship Name)') : '';
      var honor = d ? d.get('honor') : '';
      var description = d ? d.get('description') : '';
      var criteria = d ? (d.get('criteria') ? d.get('criteria').toJS() : []) : [];
      var recipients = d ? (d.get('recipients') ? d.get('recipients').toJS() : []) : [];
      return h('div', null,
        previewBar('Scholarship', '/scholarships.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', {
            style: {
              background: 'linear-gradient(135deg,#3D0910,#5C0F1C)', borderRadius: '8px',
              padding: '32px 36px', maxWidth: '640px', color: '#fff',
              fontFamily: '"Josefin Sans",sans-serif'
            }
          },
            honor ? h('p', { style: { color: '#C9A84C', fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', margin: '0 0 8px' } }, honor) : null,
            h('h2', { style: { fontFamily: '"Playfair Display",serif', fontSize: '26px', margin: '0 0 16px', color: '#FAF6EE' } }, name),
            description ? h('p', { style: { color: 'rgba(255,255,255,.75)', lineHeight: 1.7, margin: '0 0 24px', fontSize: '14px' } }, description) : null,
            criteria.length > 0 ? h('div', null,
              h('p', { style: { color: '#C9A84C', fontSize: '10px', letterSpacing: '.25em', textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 700 } }, 'Eligibility'),
              h('ul', { style: { margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,.7)', fontSize: '13px', lineHeight: 1.8 } },
                criteria.map(function (c, i) { return h('li', { key: i }, typeof c === 'string' ? c : (c.item || '')); })
              )
            ) : null,
            recipients.length > 0 ? h('div', { style: { marginTop: '20px' } },
              h('p', { style: { color: '#C9A84C', fontSize: '10px', letterSpacing: '.25em', textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 700 } }, 'Recent Recipients'),
              h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                recipients.map(function (r, i) {
                  return h('span', {
                    key: i,
                    style: {
                      background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)',
                      borderRadius: '4px', padding: '4px 12px', fontSize: '12px', color: 'rgba(255,255,255,.8)'
                    }
                  }, (r.year || '') + (r.name ? ' · ' + r.name : ''));
                })
              )
            ) : null
          )
        )
      );
    }
  });
  CMS.registerPreviewTemplate('scholarships', ScholarshipPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 🏆 AWARDS PREVIEW
   * Shows award cards as they appear on /awards.html
   * ══════════════════════════════════════════════════════════════════ */
  var AwardsPreview = createClass({
    render: function () {
      var awards = gl(this.props.entry, 'awards');
      awards = awards.slice().sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
      return h('div', null,
        previewBar('Alumni Awards', '/awards.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '24px' } },
            h('span', { className: 'section-eyebrow' }, 'Alumni Recognition'),
            h('h2', { className: 'section-title' }, 'Chapter ', h('em', null, 'Awards')),
            h('div', { className: 'section-rule' })
          ),
          awards.length === 0
            ? emptyState('No awards yet — add awards using the list on the left.')
            : h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '20px' } },
                awards.map(function (aw, i) {
                  return h('div', {
                    key: i,
                    style: {
                      background: 'linear-gradient(135deg,#3D0910,#5C0F1C)', borderRadius: '8px',
                      padding: '28px 24px', color: '#fff', fontFamily: '"Josefin Sans",sans-serif',
                      display: 'flex', flexDirection: 'column', gap: '8px'
                    }
                  },
                    h('div', { style: { fontSize: '24px', marginBottom: '4px' } }, aw.icon || '✦'),
                    h('h3', { style: { fontFamily: '"Playfair Display",serif', fontSize: '18px', margin: 0, color: '#FAF6EE' } }, aw.name || ''),
                    aw.description ? h('p', { style: { fontSize: '13px', color: 'rgba(255,255,255,.7)', lineHeight: 1.6, margin: 0 } }, aw.description) : null,
                    aw.recent_recipient ? h('p', { style: { fontSize: '12px', color: '#C9A84C', margin: '4px 0 0', fontStyle: 'italic' } }, 'Most Recent: ' + aw.recent_recipient) : null,
                    aw.apply_link ? h('a', {
                      href: '#', style: {
                        marginTop: '8px', padding: '7px 16px', background: 'transparent',
                        border: '1px solid rgba(201,168,76,.5)', color: '#C9A84C', borderRadius: '4px',
                        fontSize: '10px', letterSpacing: '.15em', textTransform: 'uppercase',
                        textDecoration: 'none', alignSelf: 'flex-start'
                      }
                    }, 'Apply / Nominate →') : null
                  );
                })
              )
        )
      );
    }
  });
  CMS.registerPreviewTemplate('awards', AwardsPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 👥 ADVISORY BOARD MEMBERS PREVIEW
   * Shows member cards as they appear on /advisory.html
   * ══════════════════════════════════════════════════════════════════ */
  var AdvisoryBoardPreview = createClass({
    render: function () {
      var members = gl(this.props.entry, 'members');
      return h('div', null,
        previewBar('Advisory Board Members', '/advisory.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '24px' } },
            h('span', { className: 'section-eyebrow' }, 'Alumni Advisory Board'),
            h('h2', { className: 'section-title' }, 'Board ', h('em', null, 'Members')),
            h('div', { className: 'section-rule' })
          ),
          members.length === 0
            ? emptyState('No members yet — add members using the list on the left.')
            : h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px' } },
                members.map(function (m, i) {
                  var initials = (m.name || '')
                    .split(' ').filter(Boolean)
                    .map(function (w) { return w[0]; })
                    .slice(0, 2).join('').toUpperCase();
                  return h('div', {
                    key: i,
                    style: {
                      background: '#fff', borderRadius: '8px', padding: '20px 16px',
                      textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,.08)',
                      fontFamily: '"Josefin Sans",sans-serif', border: '1px solid #e8dfd0'
                    }
                  },
                    h('div', {
                      style: {
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: 'linear-gradient(135deg,#5C0F1C,#8B1A2E)',
                        color: '#C9A84C', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '16px', fontWeight: 700,
                        margin: '0 auto 12px'
                      }
                    }, initials || '?'),
                    h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#1A1009' } }, m.name || ''),
                    h('div', { style: { fontSize: '11px', color: '#8B1A2E', marginTop: '2px' } }, m.class_year ? "'" + m.class_year : ''),
                    m.role ? h('div', { style: { fontSize: '10px', color: '#C9A84C', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: '4px' } }, m.role) : null
                  );
                })
              )
        )
      );
    }
  });
  CMS.registerPreviewTemplate('advisory_board', AdvisoryBoardPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 📖 ABOUT PAGE PREVIEW
   * Shows about text + dues card as they appear on /about.html
   * ══════════════════════════════════════════════════════════════════ */
  var AboutPreview = createClass({
    render: function () {
      var d = g(this.props.entry);
      if (!d) return emptyState('Loading...');
      var eyebrow = d.get('eyebrow') || 'Alumni Association';
      var line1 = d.get('title_line1') || 'Gamma Omicron';
      var line2 = d.get('title_line2') || 'Alumni Association';
      var p1 = d.get('paragraph1') || '';
      var quote = d.get('pull_quote') || '';
      var p2 = d.get('paragraph2') || '';
      var duesTitle = d.get('dues_card_title') || 'What Your Dues Support';
      var items = d.get('dues_card_items') ? d.get('dues_card_items').toJS() : [];
      return h('div', null,
        previewBar('About / Alumni Association', '/about.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '24px' } },
            h('span', { className: 'section-eyebrow' }, eyebrow),
            h('h2', { className: 'section-title' }, line1 + ' ', h('em', null, line2)),
            h('div', { className: 'section-rule' })
          ),
          p1 ? h('p', { style: { maxWidth: '680px', lineHeight: 1.8, color: '#3D0910', marginBottom: '24px' } }, p1) : null,
          quote ? h('blockquote', {
            style: {
              borderLeft: '4px solid #8B1A2E', paddingLeft: '20px', margin: '24px 0',
              fontFamily: '"Playfair Display",serif', fontStyle: 'italic',
              fontSize: '20px', color: '#5C0F1C', lineHeight: 1.5
            }
          }, '\u201c' + quote + '\u201d') : null,
          p2 ? h('p', { style: { maxWidth: '680px', lineHeight: 1.8, color: '#3D0910', marginBottom: '24px' } }, p2) : null,
          items.length > 0 ? h('div', {
            style: {
              background: 'linear-gradient(135deg,#3D0910,#5C0F1C)', borderRadius: '8px',
              padding: '24px 28px', marginTop: '24px', maxWidth: '480px'
            }
          },
            h('h3', { style: { fontFamily: '"Playfair Display",serif', color: '#C9A84C', margin: '0 0 12px', fontSize: '18px' } }, duesTitle),
            h('ul', { style: { margin: 0, paddingLeft: '20px', color: 'rgba(255,255,255,.8)', lineHeight: 2, fontSize: '13px' } },
              items.map(function (it, i) { return h('li', { key: i }, typeof it === 'string' ? it : (it.item || '')); })
            )
          ) : null
        )
      );
    }
  });
  CMS.registerPreviewTemplate('about', AboutPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 🏛️ HISTORY PREVIEW
   * Shows timeline and chapter houses as they appear on /history.html
   * ══════════════════════════════════════════════════════════════════ */
  var HistoryPreview = createClass({
    render: function () {
      var eyebrow = gf(this.props.entry, 'eyebrow') || 'Since 1930';
      var timeline = gl(this.props.entry, 'timeline');
      var houses = gl(this.props.entry, 'houses');
      return h('div', null,
        previewBar('Chapter History', '/history.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '32px' } },
            h('span', { className: 'section-eyebrow' }, eyebrow),
            h('h2', { className: 'section-title' }, 'Our ', h('em', null, 'History')),
            h('div', { className: 'section-rule' })
          ),
          /* timeline */
          timeline.length === 0
            ? emptyState('No timeline entries yet.')
            : h('div', { style: { position: 'relative', paddingLeft: '40px' } },
                h('div', { style: { position: 'absolute', left: '12px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(180deg,#C9A84C,#8B1A2E)' } }),
                timeline.map(function (item, i) {
                  return h('div', {
                    key: i,
                    style: { position: 'relative', marginBottom: '28px', fontFamily: '"Josefin Sans",sans-serif' }
                  },
                    h('div', {
                      style: {
                        position: 'absolute', left: '-34px', top: '4px',
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: '#C9A84C', border: '2px solid #fff'
                      }
                    }),
                    h('div', { style: { fontSize: '11px', color: '#C9A84C', letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700 } }, item.year || ''),
                    h('div', { style: { fontSize: '16px', fontFamily: '"Playfair Display",serif', color: '#3D0910', margin: '2px 0' } }, item.title || ''),
                    item.body ? h('p', { style: { fontSize: '13px', color: '#555', lineHeight: 1.6, margin: '4px 0 0' } }, item.body) : null
                  );
                })
              ),
          /* chapter houses */
          houses.length > 0 ? h('div', { style: { marginTop: '40px' } },
            h('h3', { style: { fontFamily: '"Playfair Display",serif', color: '#5C0F1C', marginBottom: '16px' } }, 'Chapter Houses'),
            h('table', { style: { width: '100%', borderCollapse: 'collapse', fontFamily: '"Josefin Sans",sans-serif', fontSize: '13px' } },
              h('thead', null,
                h('tr', { style: { background: '#5C0F1C', color: '#C9A84C' } },
                  h('th', { style: { padding: '8px 16px', textAlign: 'left', letterSpacing: '.1em' } }, 'ADDRESS'),
                  h('th', { style: { padding: '8px 16px', textAlign: 'left', letterSpacing: '.1em' } }, 'YEARS')
                )
              ),
              h('tbody', null,
                houses.map(function (house, i) {
                  return h('tr', { key: i, style: { borderBottom: '1px solid #e8dfd0', background: i % 2 === 0 ? '#fff' : '#FAF6EE' } },
                    h('td', { style: { padding: '8px 16px', color: '#1A1009' } }, house.address || ''),
                    h('td', { style: { padding: '8px 16px', color: '#8B1A2E' } }, house.years || '')
                  );
                })
              )
            )
          ) : null
        )
      );
    }
  });
  CMS.registerPreviewTemplate('history', HistoryPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 💝 DONATE PAGE PREVIEW
   * Shows donate section cards as they appear on /donate.html
   * ══════════════════════════════════════════════════════════════════ */
  var DonatePreview = createClass({
    render: function () {
      var d = g(this.props.entry);
      if (!d) return emptyState('Loading...');
      var intro = d.get('intro_text') || '';
      var histTitle = d.get('hist_title') || 'Preserving Our History';
      var histIntro = d.get('hist_intro') || '';
      var histNote = d.get('hist_note') || '';
      var histProjects = d.get('hist_projects') ? d.get('hist_projects').toJS() : [];
      var histTotal = d.get('hist_total') || '';
      var cardDesc = d.get('card_desc') || '';
      var options = d.get('options') ? d.get('options').toJS() : [];
      return h('div', null,
        previewBar('Donate Page', '/donate.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '24px' } },
            h('span', { className: 'section-eyebrow' }, 'Support the Brotherhood'),
            h('h2', { className: 'section-title' }, 'Give ', h('em', null, 'Back')),
            h('div', { className: 'section-rule' })
          ),
          intro ? h('p', { style: { maxWidth: '680px', lineHeight: 1.8, color: '#3D0910', marginBottom: '32px' } }, intro) : null,
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '900px' } },
            /* Historical Society Card */
            h('div', {
              style: {
                background: 'linear-gradient(135deg,#3D0910,#5C0F1C)', borderRadius: '8px',
                padding: '28px', color: '#fff', fontFamily: '"Josefin Sans",sans-serif'
              }
            },
              h('h3', { style: { fontFamily: '"Playfair Display",serif', color: '#FAF6EE', fontSize: '20px', margin: '0 0 12px' } }, histTitle),
              histIntro ? h('p', { style: { fontSize: '13px', color: 'rgba(255,255,255,.75)', lineHeight: 1.7, margin: '0 0 16px' } }, histIntro) : null,
              histNote ? h('p', { style: { fontSize: '12px', color: '#C9A84C', fontWeight: 700, margin: '0 0 8px' } }, histNote) : null,
              histProjects.map(function (p, i) {
                return h('div', {
                  key: i,
                  style: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.08)', fontSize: '12px' }
                },
                  h('span', { style: { color: p.funded ? '#6BCB77' : 'rgba(255,255,255,.75)' } }, p.name || ''),
                  h('span', { style: { color: p.funded ? '#6BCB77' : '#C9A84C', fontWeight: 700 } }, p.funded ? '✓ Funded' : (p.amount || ''))
                );
              }),
              histTotal ? h('div', { style: { marginTop: '12px', fontSize: '13px', color: '#C9A84C', fontWeight: 700 } }, 'Total: ' + histTotal) : null
            ),
            /* Alumni Association Card */
            h('div', {
              style: {
                background: '#fff', borderRadius: '8px', padding: '28px',
                border: '2px solid #8B1A2E', fontFamily: '"Josefin Sans",sans-serif'
              }
            },
              h('h3', { style: { fontFamily: '"Playfair Display",serif', color: '#5C0F1C', fontSize: '20px', margin: '0 0 12px' } }, 'Alumni Association'),
              cardDesc ? h('p', { style: { fontSize: '13px', color: '#3D0910', lineHeight: 1.7, margin: '0 0 16px' } }, cardDesc) : null,
              options.map(function (opt, i) {
                return h('div', {
                  key: i,
                  style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e8dfd0' }
                },
                  h('div', null,
                    h('div', { style: { fontSize: '13px', fontWeight: 700, color: '#1A1009' } }, opt.name || ''),
                    opt.desc ? h('div', { style: { fontSize: '11px', color: '#777' } }, opt.desc) : null
                  ),
                  opt.badge ? h('span', {
                    style: {
                      background: '#8B1A2E', color: '#fff', borderRadius: '4px',
                      padding: '3px 10px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap'
                    }
                  }, opt.badge) : null
                );
              })
            )
          )
        )
      );
    }
  });
  CMS.registerPreviewTemplate('donate_content', DonatePreview);

  /* ══════════════════════════════════════════════════════════════════
   * 📋 CHAPTER PRESIDENTS PREVIEW
   * Shows president rows as they appear on /presidents.html
   * ══════════════════════════════════════════════════════════════════ */
  var PresidentsPreview = createClass({
    render: function () {
      var presidents = gl(this.props.entry, 'presidents').slice().reverse();
      return h('div', null,
        previewBar('Chapter Presidents', '/presidents.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '24px' } },
            h('span', { className: 'section-eyebrow' }, '1930–Present'),
            h('h2', { className: 'section-title' }, 'Chapter ', h('em', null, 'Presidents')),
            h('div', { className: 'section-rule' })
          ),
          presidents.length === 0
            ? emptyState('No presidents added yet.')
            : h('table', { style: { width: '100%', maxWidth: '500px', borderCollapse: 'collapse', fontFamily: '"Josefin Sans",sans-serif' } },
                h('thead', null,
                  h('tr', { style: { background: '#5C0F1C', color: '#C9A84C' } },
                    h('th', { style: { padding: '10px 20px', textAlign: 'left', letterSpacing: '.15em', fontSize: '11px' } }, 'YEAR'),
                    h('th', { style: { padding: '10px 20px', textAlign: 'left', letterSpacing: '.15em', fontSize: '11px' } }, 'NAME')
                  )
                ),
                h('tbody', null,
                  presidents.slice(0, 20).map(function (p, i) {
                    return h('tr', { key: i, style: { borderBottom: '1px solid #e8dfd0', background: i % 2 === 0 ? '#fff' : '#FAF6EE' } },
                      h('td', { style: { padding: '9px 20px', color: '#8B1A2E', fontSize: '12px', fontWeight: 700 } }, p.year || ''),
                      h('td', { style: { padding: '9px 20px', color: '#1A1009', fontSize: '14px' } }, p.name || '')
                    );
                  })
                )
              ),
          presidents.length > 20 ? h('p', { style: { color: '#999', fontSize: '12px', marginTop: '8px', fontFamily: '"Josefin Sans",sans-serif' } }, '+ ' + (presidents.length - 20) + ' more entries') : null
        )
      );
    }
  });
  CMS.registerPreviewTemplate('presidents', PresidentsPreview);

  /* ══════════════════════════════════════════════════════════════════
   * ⚙️ SETTINGS PREVIEW
   * Shows the homepage hero stat bar as it will look
   * ══════════════════════════════════════════════════════════════════ */
  var SettingsPreview = createClass({
    render: function () {
      var d = g(this.props.entry);
      if (!d) return emptyState('Loading...');
      var tagline = d.get('tagline') || 'Once a Pike, always a Pike.';
      var alumni = d.get('alumni_count') || '1,200+';
      var smythe = d.get('smythe_count') || '7×';
      var founded = d.get('founded') || '1930';
      var refounded = d.get('refounded') || '2019';
      var blurb = d.get('footer_blurb') || '';
      return h('div', null,
        previewBar('Site-Wide Settings'),
        h('div', { className: 'cms-preview-scroll' },
          /* hero preview */
          h('div', {
            style: {
              background: 'linear-gradient(135deg,#3D0910 0%,#5C0F1C 60%,#8B1A2E 100%)',
              borderRadius: '8px', padding: '48px 32px', marginBottom: '24px',
              fontFamily: '"Josefin Sans",sans-serif', textAlign: 'center'
            }
          },
            h('p', { style: { color: '#C9A84C', fontSize: '11px', letterSpacing: '.3em', textTransform: 'uppercase', margin: '0 0 8px' } }, 'Est. ' + founded + ' · Re-est. ' + refounded),
            h('p', { style: { color: 'rgba(255,255,255,.6)', fontStyle: 'italic', fontFamily: '"Playfair Display",serif', fontSize: '16px', margin: '0 0 24px' } }, tagline),
            h('div', { style: { display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' } },
              h('div', { style: { textAlign: 'center' } },
                h('div', { style: { fontSize: '40px', fontWeight: 800, color: '#C9A84C' } }, alumni),
                h('div', { style: { fontSize: '10px', color: 'rgba(255,255,255,.5)', letterSpacing: '.2em', textTransform: 'uppercase', marginTop: '4px' } }, 'Alumni')
              ),
              h('div', { style: { textAlign: 'center' } },
                h('div', { style: { fontSize: '40px', fontWeight: 800, color: '#C9A84C' } }, smythe),
                h('div', { style: { fontSize: '10px', color: 'rgba(255,255,255,.5)', letterSpacing: '.2em', textTransform: 'uppercase', marginTop: '4px' } }, 'Smythe Trophies')
              )
            )
          ),
          /* footer blurb preview */
          blurb ? h('div', {
            style: {
              background: '#1A1009', borderRadius: '6px', padding: '20px 24px',
              fontFamily: '"Josefin Sans",sans-serif'
            }
          },
            h('p', { style: { color: 'rgba(255,255,255,.5)', fontSize: '11px', letterSpacing: '.15em', textTransform: 'uppercase', margin: '0 0 6px' } }, 'Footer blurb preview:'),
            h('p', { style: { color: 'rgba(255,255,255,.6)', fontSize: '12px', lineHeight: 1.7, margin: 0 } }, blurb)
          ) : null
        )
      );
    }
  });
  CMS.registerPreviewTemplate('settings', SettingsPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 📝 CHAPTER PAGE TEXT PREVIEW
   * Shows the mission quote and body text for /chapter.html
   * ══════════════════════════════════════════════════════════════════ */
  var ChapterContentPreview = createClass({
    render: function () {
      var d = g(this.props.entry);
      if (!d) return emptyState('Loading...');
      var quote = d.get('mission_quote') || '';
      var p1 = d.get('paragraph1') || '';
      var p2 = d.get('paragraph2') || '';
      var smythe = d.get('smythe_label') || '';
      var years = d.get('years_of_brotherhood') || '';
      return h('div', null,
        previewBar('Active Chapter — Text Content', '/chapter.html'),
        h('div', { className: 'cms-preview-scroll' },
          quote ? h('blockquote', {
            style: {
              borderLeft: '4px solid #C9A84C', paddingLeft: '20px', margin: '0 0 24px',
              fontFamily: '"Playfair Display",serif', fontStyle: 'italic',
              fontSize: '20px', color: '#5C0F1C', lineHeight: 1.5
            }
          }, '\u201c' + quote + '\u201d') : null,
          p1 ? h('p', { style: { lineHeight: 1.8, color: '#3D0910', marginBottom: '16px' } }, p1) : null,
          p2 ? h('p', { style: { lineHeight: 1.8, color: '#3D0910', marginBottom: '24px' } }, p2) : null,
          years ? h('div', {
            style: {
              display: 'inline-block', background: 'linear-gradient(135deg,#3D0910,#5C0F1C)',
              borderRadius: '6px', padding: '16px 28px', marginBottom: '16px',
              fontFamily: '"Josefin Sans",sans-serif'
            }
          },
            h('span', { style: { fontSize: '36px', fontWeight: 800, color: '#C9A84C' } }, years),
            h('span', { style: { fontSize: '12px', color: 'rgba(255,255,255,.6)', marginLeft: '8px', letterSpacing: '.15em', textTransform: 'uppercase' } }, 'Years of Brotherhood')
          ) : null,
          smythe ? h('p', { style: { fontSize: '11px', color: '#999', fontFamily: '"Josefin Sans",sans-serif', letterSpacing: '.1em' } }, smythe) : null
        )
      );
    }
  });
  CMS.registerPreviewTemplate('chapter_content', ChapterContentPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 👥 ADVISORY PAGE TEXT PREVIEW
   * Shows the description and missing alumni banner
   * ══════════════════════════════════════════════════════════════════ */
  var AdvisoryContentPreview = createClass({
    render: function () {
      var d = g(this.props.entry);
      if (!d) return emptyState('Loading...');
      var desc = d.get('description') || '';
      var mEyebrow = d.get('missing_eyebrow') || "We're Looking For You";
      var mTitle = d.get('missing_title') || 'Missing Alumni';
      var mDesc = d.get('missing_desc') || '';
      return h('div', null,
        previewBar('Advisory Page — Text Content', '/advisory.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '16px' } },
            h('span', { className: 'section-eyebrow' }, 'Alumni Advisory Board'),
            h('h2', { className: 'section-title' }, 'Board ', h('em', null, 'Members')),
            h('div', { className: 'section-rule' })
          ),
          desc ? h('p', { style: { maxWidth: '640px', lineHeight: 1.8, color: '#3D0910', marginBottom: '40px', fontSize: '15px' } }, desc) : null,
          /* missing alumni banner */
          h('div', {
            style: {
              background: 'linear-gradient(135deg,#3D0910,#5C0F1C)', borderRadius: '8px',
              padding: '32px 36px', maxWidth: '640px', fontFamily: '"Josefin Sans",sans-serif'
            }
          },
            h('span', { style: { color: '#C9A84C', fontSize: '10px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 700 } }, mEyebrow),
            h('h3', { style: { fontFamily: '"Playfair Display",serif', color: '#FAF6EE', fontSize: '24px', margin: '8px 0 12px' } }, mTitle),
            mDesc ? h('p', { style: { color: 'rgba(255,255,255,.7)', fontSize: '14px', lineHeight: 1.7, margin: 0 },
              dangerouslySetInnerHTML: { __html: mDesc }
            }) : null
          )
        )
      );
    }
  });
  CMS.registerPreviewTemplate('advisory_content', AdvisoryContentPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 🔍 MISSING ALUMNI LIST PREVIEW
   * ══════════════════════════════════════════════════════════════════ */
  var MissingAlumniPreview = createClass({
    render: function () {
      var decades = gl(this.props.entry, 'decades');
      return h('div', null,
        previewBar('Missing Alumni List', '/missing-alumni.html'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '24px' } },
            h('span', { className: 'section-eyebrow' }, "We're Looking For You"),
            h('h2', { className: 'section-title' }, 'Missing ', h('em', null, 'Alumni')),
            h('div', { className: 'section-rule' })
          ),
          decades.length === 0
            ? emptyState('No entries yet.')
            : h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '20px' } },
                decades.map(function (dec, i) {
                  var names = Array.isArray(dec.names) ? dec.names : [];
                  return h('div', {
                    key: i,
                    style: {
                      background: '#fff', border: '1px solid #e8dfd0', borderRadius: '6px',
                      overflow: 'hidden', fontFamily: '"Josefin Sans",sans-serif'
                    }
                  },
                    h('div', {
                      style: {
                        background: '#5C0F1C', color: '#C9A84C', padding: '8px 16px',
                        fontSize: '11px', letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700
                      }
                    }, dec.decade || ''),
                    h('ul', { style: { margin: 0, padding: '12px 16px', listStyle: 'none' } },
                      names.slice(0, 8).map(function (name, j) {
                        return h('li', {
                          key: j,
                          style: { fontSize: '12px', color: '#3D0910', padding: '3px 0', borderBottom: j < names.length - 1 ? '1px solid #f0e8dc' : 'none' }
                        }, typeof name === 'string' ? name : (name.item || ''));
                      }),
                      names.length > 8 ? h('li', { style: { fontSize: '11px', color: '#999', marginTop: '4px' } }, '+ ' + (names.length - 8) + ' more') : null
                    )
                  );
                })
              )
        )
      );
    }
  });
  CMS.registerPreviewTemplate('missing_alumni', MissingAlumniPreview);

  /* ══════════════════════════════════════════════════════════════════
   * 🏠 HOUSING DONORS PREVIEW
   * ══════════════════════════════════════════════════════════════════ */
  var HousingPreview = createClass({
    render: function () {
      var societies = gl(this.props.entry, 'societies');
      return h('div', null,
        previewBar('Housing Corporation Donors'),
        h('div', { className: 'cms-preview-scroll' },
          h('div', { className: 'section-header', style: { marginBottom: '24px' } },
            h('span', { className: 'section-eyebrow' }, 'Donor Recognition'),
            h('h2', { className: 'section-title' }, 'Housing ', h('em', null, 'Donors')),
            h('div', { className: 'section-rule' })
          ),
          societies.length === 0
            ? emptyState('No giving societies yet.')
            : societies.map(function (soc, i) {
                var donors = Array.isArray(soc.donors) ? soc.donors : [];
                return h('div', {
                  key: i,
                  style: {
                    background: 'linear-gradient(135deg,#3D0910,#5C0F1C)',
                    borderRadius: '8px', marginBottom: '16px', overflow: 'hidden'
                  }
                },
                  h('div', {
                    style: {
                      padding: '12px 20px', borderBottom: '1px solid rgba(201,168,76,.3)',
                      color: '#C9A84C', fontFamily: '"Josefin Sans",sans-serif',
                      fontSize: '11px', letterSpacing: '.25em', textTransform: 'uppercase', fontWeight: 700
                    }
                  }, soc.level || ''),
                  h('div', {
                    style: {
                      padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '8px'
                    }
                  },
                    donors.map(function (name, j) {
                      return h('span', {
                        key: j,
                        style: {
                          background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)',
                          borderRadius: '4px', padding: '4px 12px', color: 'rgba(255,255,255,.8)',
                          fontSize: '12px', fontFamily: '"Josefin Sans",sans-serif'
                        }
                      }, typeof name === 'string' ? name : (name.item || ''));
                    })
                  )
                );
              })
        )
      );
    }
  });
  CMS.registerPreviewTemplate('housing', HousingPreview);

})();
