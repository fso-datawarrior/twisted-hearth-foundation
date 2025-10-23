import { FullRelease } from './release-api';

export interface EmailTemplateData {
  html: string;
  subject: string;
}

/**
 * Generate admin-friendly email HTML with technical details
 */
export function generateAdminEmailHtml(release: FullRelease): EmailTemplateData {
  const subject = `🎃 System Update v${release.version} - Technical Summary`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .section { margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #8B5CF6; }
    .section h3 { color: #8B5CF6; margin-top: 0; }
    .feature-item { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; border: 1px solid #e9ecef; }
    .api-change { font-family: monospace; background: #f1f3f4; padding: 8px; border-radius: 4px; margin: 5px 0; }
    .breaking { background: #fff3cd; border-color: #ffc107; }
    .footer { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; font-size: 14px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎃 System Update v${release.version}</h1>
    <p>Technical Summary for Administrators</p>
    <p><strong>Release Date:</strong> ${new Date(release.release_date).toLocaleDateString()}</p>
    <p><strong>Environment:</strong> ${release.environment}</p>
  </div>

  ${release.summary ? `
  <div class="section">
    <h3>📋 Executive Summary</h3>
    <p>${release.summary}</p>
  </div>
  ` : ''}

  ${release.features && release.features.length > 0 ? `
  <div class="section">
    <h3>✨ Features Added</h3>
    ${release.features.map(feature => `
      <div class="feature-item">
        <h4>${feature.title}</h4>
        <p><strong>Description:</strong> ${feature.description}</p>
        ${feature.benefit ? `<p><strong>Benefit:</strong> ${feature.benefit}</p>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.api_changes && release.api_changes.length > 0 ? `
  <div class="section">
    <h3>🔧 API Changes</h3>
    ${release.api_changes.map(change => `
      <div class="api-change">
        <strong>${change.endpoint}</strong> (${change.change_type?.toUpperCase()})
        <br>${change.description}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.changes && release.changes.length > 0 ? `
  <div class="section">
    <h3>🔨 Changes</h3>
    ${release.changes.map(change => `
      <div class="feature-item">
        <strong>${change.category?.replace('_', ' ').toUpperCase()}</strong>
        ${change.component ? ` - ${change.component}` : ''}
        <br>${change.description}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.notes && release.notes.some(n => n.note_type === 'breaking') ? `
  <div class="section breaking">
    <h3>⚠️ Breaking Changes</h3>
    ${release.notes.filter(n => n.note_type === 'breaking').map(note => `
      <div class="feature-item">
        <p>${note.content}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.notes && release.notes.some(n => n.note_type === 'known_issue') ? `
  <div class="section">
    <h3>🐛 Known Issues</h3>
    ${release.notes.filter(n => n.note_type === 'known_issue').map(note => `
      <div class="feature-item">
        <p>${note.content}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.notes && release.notes.some(n => n.note_type === 'technical') ? `
  <div class="section">
    <h3>🔧 Technical Notes</h3>
    ${release.notes.filter(n => n.note_type === 'technical').map(note => `
      <div class="feature-item">
        <p>${note.content}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <p>For technical support, contact the development team.</p>
    <p><a href="${window.location.origin}/admin">Admin Dashboard</a></p>
  </div>
</body>
</html>`;

  return { html, subject };
}

/**
 * Generate user-friendly email HTML with simplified content
 */
export function generateUserEmailHtml(release: FullRelease): EmailTemplateData {
  const subject = `🎃 We Made Your Party Experience Even Better! v${release.version}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #d4af37, #ffd700); color: #2d1b4e; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .section { margin: 25px 0; padding: 20px; background: #fff; border-radius: 8px; border: 2px solid #d4af37; }
    .section h3 { color: #2d1b4e; margin-top: 0; }
    .feature-card { margin: 15px 0; padding: 20px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 10px; border: 2px solid #d4af37; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #d4af37, #ffd700); color: #2d1b4e; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; font-size: 14px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎃 We Made Your Party Experience Even Better!</h1>
    <p>Hey party people! 🎉✨</p>
    <p><strong>Version ${release.version}</strong> • ${new Date(release.release_date).toLocaleDateString()}</p>
  </div>

  ${release.summary ? `
  <div class="section">
    <h3>🎊 What's New This Time?</h3>
    <p>${release.summary}</p>
  </div>
  ` : ''}

  ${release.features && release.features.length > 0 ? `
  <div class="section">
    <h3>✨ What's New & Awesome!</h3>
    <p>We've been working hard to make your party experience even more magical! 🎩✨</p>
    ${release.features.map(feature => `
      <div class="feature-card">
        <h4>🎉 ${feature.title}</h4>
        <p>${feature.benefit || feature.description}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${release.changes && release.changes.filter(c => c.category === 'bug_fix').length > 0 ? `
  <div class="section">
    <h3>🔧 What We Fixed!</h3>
    <p>Oops! We found some sneaky bugs and squashed them! 🐛💥</p>
    <ul>
      ${release.changes.filter(c => c.category === 'bug_fix').map(change => `
        <li>🎯 ${change.description}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${release.changes && release.changes.filter(c => c.category === 'improvement').length > 0 ? `
  <div class="section">
    <h3>🚀 What's Better Now!</h3>
    <p>We made everything smoother and more fun! 🌟</p>
    <ul>
      ${release.changes.filter(c => c.category === 'improvement').map(change => `
        <li>⭐ ${change.description}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${release.changes && release.changes.filter(c => c.category === 'ui_update').length > 0 ? `
  <div class="section">
    <h3>🎨 Lookin' Good!</h3>
    <p>We spruced up the interface to make it even more beautiful! ✨</p>
    <ul>
      ${release.changes.filter(c => c.category === 'ui_update').map(change => `
        <li>🎭 ${change.description}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${release.notes && release.notes.some(n => n.note_type === 'known_issue') ? `
  <div class="section">
    <h3>⚠️ Heads Up, Party People!</h3>
    <p>We found a few little quirks that we're working on fixing:</p>
    <ul>
      ${release.notes.filter(n => n.note_type === 'known_issue').map(note => `
        <li>🔍 ${note.content}</li>
      `).join('')}
    </ul>
    <p><em>Don't worry - we're on it! These will be fixed soon! 🛠️✨</em></p>
  </div>
  ` : ''}

  <div style="text-align: center; margin: 30px 0;">
    <a href="${window.location.origin}" class="cta-button">Check It Out! 🎃</a>
  </div>

  <div class="footer">
    <p><strong>See you at the bash! 🎭✨</strong></p>
    <p>Questions? Just reply to this email!</p>
  </div>
</body>
</html>`;

  return { html, subject };
}

/**
 * Generate email preview for a release
 */
export function generateEmailPreview(release: FullRelease, emailType: 'admin' | 'user'): EmailTemplateData {
  return emailType === 'admin' 
    ? generateAdminEmailHtml(release)
    : generateUserEmailHtml(release);
}
