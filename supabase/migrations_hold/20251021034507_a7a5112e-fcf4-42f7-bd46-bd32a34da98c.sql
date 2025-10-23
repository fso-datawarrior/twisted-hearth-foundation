-- Insert System Update Email Templates
-- Admin/Technical template and User/Guest-friendly template

INSERT INTO email_templates (
  name,
  subject,
  html_content,
  text_content,
  preview_text,
  category,
  is_active
) VALUES (
  'System Update - Admin Summary',
  '🔧 System Update {{VERSION}} - Technical Summary',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Update - Admin Summary</title>
  <style>
    body { font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
    .container { background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-left: 5px solid #3b82f6; }
    .header { text-align: center; padding-bottom: 30px; border-bottom: 2px solid #e5e7eb; margin-bottom: 30px; }
    .header h1 { color: #1e40af; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; }
    .version-badge { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 600; margin-top: 15px; }
    .section { margin: 35px 0; padding: 25px; border-radius: 8px; border-left: 4px solid #e5e7eb; }
    .section.features { background-color: #f0f9ff; border-left-color: #3b82f6; }
    .section.apis { background-color: #fef3c7; border-left-color: #f59e0b; }
    .section.ui { background-color: #f0fdf4; border-left-color: #10b981; }
    .section.bugs { background-color: #fef2f2; border-left-color: #ef4444; }
    .section.breaking { background-color: #fef3c7; border-left-color: #f59e0b; }
    .section.database { background-color: #f3e8ff; border-left-color: #8b5cf6; }
    .section-title { color: #1f2937; font-size: 22px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; font-weight: 600; }
    .section-icon { font-size: 28px; }
    .item-list { margin: 0; padding-left: 0; list-style: none; }
    .item-list li { margin: 15px 0; padding: 15px; background-color: white; border-radius: 6px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .item-list li strong { color: #1f2937; font-weight: 600; }
    .code-block { background-color: #1f2937; color: #f9fafb; padding: 15px; border-radius: 6px; font-family: ''Courier New'', monospace; font-size: 14px; margin: 10px 0; overflow-x: auto; }
    .endpoint { background-color: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 13px; }
    .change-type { background-color: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px; }
    .breaking-change { background-color: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px; }
    .highlight-box { background-color: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }
    .highlight-box h3 { color: #92400e; margin-top: 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; transition: all 0.3s ease; }
    .cta-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
    .footer { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .footer a { color: #3b82f6; text-decoration: none; font-weight: 500; }
    .metadata { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
    .metadata-item { display: flex; justify-content: space-between; margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .metadata-item:last-child { border-bottom: none; }
    .metadata-label { font-weight: 600; color: #374151; }
    .metadata-value { color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔧 System Update - Technical Summary</h1>
      <p style="color: #6b7280; margin: 5px 0; font-size: 16px;">The Ruths'' Twisted Fairytale Halloween Bash</p>
      <span class="version-badge">Version {{VERSION}}</span>
    </div>
    <div class="metadata">
      <div class="metadata-item"><span class="metadata-label">Release Date:</span><span class="metadata-value">{{RELEASE_DATE}}</span></div>
      <div class="metadata-item"><span class="metadata-label">Environment:</span><span class="metadata-value">Production</span></div>
      <div class="metadata-item"><span class="metadata-label">Deployment Status:</span><span class="metadata-value">✅ Complete</span></div>
    </div>
    {{#if SUMMARY}}<div class="section"><div class="section-title"><span class="section-icon">📋</span><strong>Executive Summary</strong></div><p style="font-size: 16px; line-height: 1.7; color: #374151;">{{SUMMARY}}</p></div>{{/if}}
    {{#if FEATURES_ADDED}}<div class="section features"><div class="section-title"><span class="section-icon">✨</span><strong>Features Added</strong></div><ul class="item-list">{{#each FEATURES_ADDED}}<li><strong>{{this.title}}:</strong> {{this.description}}{{#if this.benefit}}<br><em style="color: #059669;">Benefit: {{this.benefit}}</em>{{/if}}</li>{{/each}}</ul></div>{{/if}}
    {{#if APIS_CHANGED}}<div class="section apis"><div class="section-title"><span class="section-icon">🔧</span><strong>APIs Changed</strong></div><ul class="item-list">{{#each APIS_CHANGED}}<li><span class="endpoint">{{this.endpoint}}</span><span class="change-type">{{this.change}}</span></li>{{/each}}</ul></div>{{/if}}
    {{#if UI_UPDATES}}<div class="section ui"><div class="section-title"><span class="section-icon">🎨</span><strong>UI Updates</strong></div><ul class="item-list">{{#each UI_UPDATES}}<li><strong>{{this.component}}:</strong> {{this.change}}</li>{{/each}}</ul></div>{{/if}}
    {{#if BUG_FIXES}}<div class="section bugs"><div class="section-title"><span class="section-icon">🐛</span><strong>Bug Fixes</strong></div><ul class="item-list">{{#each BUG_FIXES}}<li>{{this}}</li>{{/each}}</ul></div>{{/if}}
    {{#if IMPROVEMENTS}}<div class="section ui"><div class="section-title"><span class="section-icon">🚀</span><strong>Performance Improvements</strong></div><ul class="item-list">{{#each IMPROVEMENTS}}<li>{{this}}</li>{{/each}}</ul></div>{{/if}}
    {{#if BREAKING_CHANGES}}<div class="highlight-box"><h3 style="color: #dc2626; margin-top: 0;">⚠️ Breaking Changes</h3><ul class="item-list">{{#each BREAKING_CHANGES}}<li><span class="breaking-change">BREAKING</span>{{this}}</li>{{/each}}</ul><p style="margin: 15px 0 0 0; font-size: 14px; color: #dc2626;"><strong>Action Required:</strong> Please review these changes and update your integrations accordingly.</p></div>{{/if}}
    {{#if DATABASE_CHANGES}}<div class="section database"><div class="section-title"><span class="section-icon">🗄️</span><strong>Database Changes</strong></div><ul class="item-list">{{#each DATABASE_CHANGES}}<li>{{this}}</li>{{/each}}</ul></div>{{/if}}
    {{#if KNOWN_ISSUES}}<div class="section bugs"><div class="section-title"><span class="section-icon">⚠️</span><strong>Known Issues</strong></div><ul class="item-list">{{#each KNOWN_ISSUES}}<li>{{this}}</li>{{/each}}</ul><p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">These issues are being actively monitored and will be addressed in upcoming releases.</p></div>{{/if}}
    {{#if TECHNICAL_NOTES}}<div class="section"><div class="section-title"><span class="section-icon">📝</span><strong>Technical Notes</strong></div><div class="code-block">{{TECHNICAL_NOTES}}</div></div>{{/if}}
    <div style="text-align: center; margin: 40px 0;"><a href="{{SITE_URL}}/admin" class="cta-button">View Admin Dashboard</a></div>
    {{#if ADDITIONAL_NOTES}}<div class="section"><div class="section-title"><span class="section-icon">📄</span><strong>Additional Information</strong></div><p style="color: #6b7280; font-style: italic;">{{ADDITIONAL_NOTES}}</p></div>{{/if}}
    <div class="footer"><p><strong>Technical Contact:</strong> <a href="{{SITE_URL}}/admin/contact">Admin Support</a></p><p><a href="{{SITE_URL}}/admin/changelog">View Full Changelog</a> | <a href="{{SITE_URL}}/admin/docs">API Documentation</a> | <a href="{{SITE_URL}}/admin/settings">System Settings</a></p><p style="margin-top: 20px; font-size: 12px;">This technical summary was generated automatically. For detailed implementation notes, refer to the development documentation.</p></div>
  </div>
</body>
</html>',
  'System Update {{VERSION}} - Technical Summary

Release Date: {{RELEASE_DATE}}
Environment: Production
Deployment Status: Complete

{{SUMMARY}}

Features Added:
{{#each FEATURES_ADDED}}
- {{this.title}}: {{this.description}}
{{/each}}

Bug Fixes:
{{#each BUG_FIXES}}
- {{this}}
{{/each}}

View full details at: {{SITE_URL}}/admin',
  'Technical system update summary for administrators',
  'system-admin',
  true
),
(
  'System Update - Guest Announcement',
  '🎃 We Made Your Party Experience Even Better! {{VERSION}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Party Update - The Ruths'' Bash</title>
  <style>
    body { font-family: ''Comic Sans MS'', cursive, sans-serif; line-height: 1.6; color: #2d1b4e; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #2d1b4e 0%, #1a0f2e 100%); }
    .container { background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%); border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 3px solid #d4af37; position: relative; overflow: hidden; }
    .container::before { content: ''''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%); animation: sparkle 3s ease-in-out infinite; }
    @keyframes sparkle { 0%, 100% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.1); } }
    .header { text-align: center; padding-bottom: 30px; border-bottom: 3px solid #d4af37; margin-bottom: 30px; position: relative; z-index: 1; }
    .header h1 { color: #d4af37; margin: 0 0 15px 0; font-size: 36px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); background: linear-gradient(45deg, #d4af37, #ffd700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .party-subtitle { color: #2d1b4e; margin: 10px 0; font-size: 18px; font-weight: bold; }
    .version-badge { display: inline-block; background: linear-gradient(135deg, #d4af37, #ffd700); color: #2d1b4e; padding: 10px 25px; border-radius: 30px; font-size: 16px; font-weight: bold; margin-top: 15px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4); text-transform: uppercase; letter-spacing: 1px; }
    .greeting { text-align: center; margin: 30px 0; font-size: 24px; color: #2d1b4e; font-weight: bold; }
    .section { margin: 35px 0; padding: 25px; border-radius: 15px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(255, 215, 0, 0.05)); border: 2px solid rgba(212, 175, 55, 0.3); position: relative; z-index: 1; }
    .section-title { color: #2d1b4e; font-size: 24px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; font-weight: bold; }
    .section-icon { font-size: 32px; }
    .feature-card { background: white; margin: 15px 0; padding: 20px; border-radius: 15px; border: 2px solid #d4af37; box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
    .feature-card:hover { transform: translateY(-5px); }
    .feature-emoji { font-size: 28px; margin-right: 15px; }
    .feature-title { color: #2d1b4e; font-size: 18px; font-weight: bold; margin-bottom: 8px; }
    .feature-description { color: #4a4a4a; font-size: 16px; line-height: 1.5; }
    .celebration-box { background: linear-gradient(135deg, #d4af37, #ffd700); color: #2d1b4e; padding: 25px; border-radius: 20px; margin: 30px 0; text-align: center; font-weight: bold; font-size: 18px; box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4); }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #d4af37, #ffd700); color: #2d1b4e; padding: 18px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 18px; margin: 25px 0; box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; }
    .cta-button:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(212, 175, 55, 0.6); }
    .party-footer { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 3px solid #d4af37; color: #2d1b4e; font-size: 16px; position: relative; z-index: 1; }
    .party-footer a { color: #d4af37; text-decoration: none; font-weight: bold; }
    .party-footer a:hover { text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
    .sparkle { position: absolute; color: #d4af37; font-size: 20px; animation: twinkle 2s ease-in-out infinite; }
    .sparkle:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
    .sparkle:nth-child(2) { top: 20%; right: 15%; animation-delay: 0.5s; }
    .sparkle:nth-child(3) { bottom: 30%; left: 20%; animation-delay: 1s; }
    .sparkle:nth-child(4) { bottom: 15%; right: 10%; animation-delay: 1.5s; }
    @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
    .fun-list { list-style: none; padding: 0; }
    .fun-list li { margin: 15px 0; padding: 15px; background: white; border-radius: 12px; border-left: 5px solid #d4af37; box-shadow: 0 3px 10px rgba(0,0,0,0.1); font-size: 16px; }
    .highlight-fun { background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(255, 215, 0, 0.1)); padding: 20px; border-radius: 15px; border: 2px solid #d4af37; margin: 25px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sparkle">✨</div>
    <div class="sparkle">🎉</div>
    <div class="sparkle">🎃</div>
    <div class="sparkle">🎭</div>
    <div class="header">
      <h1>🎃 We Made Your Party Experience Even Better!</h1>
      <p class="party-subtitle">The Ruths'' Twisted Fairytale Halloween Bash</p>
      <span class="version-badge">Version {{VERSION}}</span>
    </div>
    <div class="greeting">Hey party people! 🎉✨</div>
    {{#if FEATURES_ADDED}}<div class="section"><div class="section-title"><span class="section-icon">✨</span><strong>What''s New & Awesome!</strong></div><p style="font-size: 18px; margin-bottom: 20px; color: #2d1b4e;">We''ve been working hard to make your party experience even more magical! 🎩✨</p>{{#each FEATURES_ADDED}}<div class="feature-card"><span class="feature-emoji">🎉</span><div style="display: inline-block; vertical-align: top;"><div class="feature-title">{{this.title}}</div><div class="feature-description">{{this.benefit}}</div></div></div>{{/each}}</div>{{/if}}
    {{#if BUG_FIXES}}<div class="section"><div class="section-title"><span class="section-icon">🔧</span><strong>What We Fixed!</strong></div><p style="font-size: 18px; margin-bottom: 20px; color: #2d1b4e;">Oops! We found some sneaky bugs and squashed them! 🐛💥</p><ul class="fun-list">{{#each BUG_FIXES}}<li>🎯 {{this}}</li>{{/each}}</ul></div>{{/if}}
    {{#if IMPROVEMENTS}}<div class="section"><div class="section-title"><span class="section-icon">🚀</span><strong>What''s Better Now!</strong></div><p style="font-size: 18px; margin-bottom: 20px; color: #2d1b4e;">We made everything smoother and more fun! 🌟</p><ul class="fun-list">{{#each IMPROVEMENTS}}<li>⭐ {{this}}</li>{{/each}}</ul></div>{{/if}}
    {{#if KNOWN_ISSUES}}<div class="highlight-fun"><h3 style="color: #2d1b4e; margin-top: 0; font-size: 20px;">⚠️ Heads Up, Party People!</h3><p style="margin: 15px 0; font-size: 16px;">We found a few little quirks that we''re working on fixing:</p><ul class="fun-list" style="text-align: left;">{{#each KNOWN_ISSUES}}<li>🔍 {{this}}</li>{{/each}}</ul><p style="margin: 15px 0 0 0; font-size: 14px; font-style: italic;">Don''t worry - we''re on it! These will be fixed soon! 🛠️✨</p></div>{{/if}}
    <div class="celebration-box"><div style="font-size: 24px; margin-bottom: 10px;">🎊🎉🎊</div><div>Everything is ready for an amazing party experience!</div><div style="font-size: 14px; margin-top: 10px;">November 1st, 2025 • 1816 White Feather Drive, Longmont, CO</div></div>
    <div style="text-align: center; margin: 40px 0;"><a href="{{SITE_URL}}" class="cta-button">Check It Out! 🎃</a></div>
    {{#if ADDITIONAL_NOTES}}<div class="section"><div class="section-title"><span class="section-icon">📝</span><strong>One More Thing!</strong></div><p style="color: #2d1b4e; font-size: 16px; font-style: italic;">{{ADDITIONAL_NOTES}}</p></div>{{/if}}
    <div class="party-footer"><p style="font-size: 20px; margin-bottom: 15px;"><strong>See you at the bash! 🎭✨</strong></p><p>Questions? <a href="{{SITE_URL}}/contact">Drop us a line!</a><br>Want to change your notifications? <a href="{{SITE_URL}}/settings">Click here!</a></p><p style="margin-top: 20px; font-size: 14px; color: #666;">The Ruths'' Twisted Fairytale Halloween Bash<br>Making every moment magical! 🎃🎉</p></div>
  </div>
</body>
</html>',
  'Party Update {{VERSION}}

Hey party people!

What''s New:
{{#each FEATURES_ADDED}}
- {{this.title}}: {{this.benefit}}
{{/each}}

Check it out at: {{SITE_URL}}

See you at the bash!',
  'Fun party update announcement for guests',
  'system-user',
  true
)
ON CONFLICT DO NOTHING;