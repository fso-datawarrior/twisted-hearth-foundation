-- Pre-seed email templates for the Twisted Tale event
-- These templates use the Gothic/twisted fairytale theme from the existing email designs

-- Template 1: Event Updates & Announcements
INSERT INTO public.email_templates (name, subject, preview_text, html_content, is_active, created_by)
VALUES (
  'Event Updates & Announcements',
  '🎭 Important Update About Twisted Tale',
  'We have exciting news to share about the upcoming event!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Update - Twisted Tale</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Georgia'', serif; background: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: rgba(26, 15, 46, 0.6); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; color: #d4af37; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3); letter-spacing: 1px;">
                🎭 Twisted Tale
              </h1>
              <p style="margin: 10px 0 0 0; color: #e8d4a8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                The Ruths'' Fairytale Halloween Bash
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Hello {{name}}! 👋
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                We have some exciting updates to share about the Twisted Tale event!
              </p>

              <div style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                  [Add your announcement details here - this template is ready for customization]
                </p>
              </div>

              <p style="margin: 24px 0 0 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                We can''t wait to see you there!
              </p>

              <p style="margin: 16px 0 0 0; color: #b8a8c8; font-size: 14px; line-height: 1.6;">
                The Ruths<br>
                <em>Your Twisted Tale Hosts</em>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
              <p style="margin: 0; color: #b8a8c8; font-size: 13px; line-height: 1.6; text-align: center;">
                {{event_date}} • {{event_time}}<br>
                {{event_address}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@twistedtale.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Template 2: One Week Reminder - Costume & Prep
INSERT INTO public.email_templates (name, subject, preview_text, html_content, is_active, created_by)
VALUES (
  'One Week Reminder - Costume & Prep',
  '🎃 One Week Until Twisted Tale - Time to Get Creative!',
  'The big night is almost here! Let''s talk costumes and preparations...',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>One Week Reminder - Twisted Tale</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Georgia'', serif; background: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: rgba(26, 15, 46, 0.6); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; color: #d4af37; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3); letter-spacing: 1px;">
                🎭 Twisted Tale
              </h1>
              <p style="margin: 10px 0 0 0; color: #e8d4a8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                The Ruths'' Fairytale Halloween Bash
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 28px; font-weight: 600; text-align: center;">
                🎃 Just 7 Days to Go!
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                Hello {{name}},
              </p>

              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                The enchanted evening is almost upon us! In one week, you''ll be stepping into our twisted fairytale world.
              </p>

              <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(138, 43, 226, 0.2)); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #d4af37; font-size: 20px; font-weight: 600;">
                  ✨ Costume Checkpoint
                </h3>
                <p style="margin: 0 0 12px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                  Time to unleash your creativity! Remember, we''re looking for twisted fairytale characters that would make the Brothers Grimm proud.
                </p>
                <p style="margin: 0; color: #e8d4a8; font-size: 15px; line-height: 1.6; font-style: italic;">
                  💡 Your costume idea: {{costume_idea}}
                </p>
              </div>

              <div style="background: rgba(212, 175, 55, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #d4af37; font-size: 18px; font-weight: 600;">
                  📋 Final Checklist:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #ffffff; font-size: 15px; line-height: 1.8;">
                  <li>Perfect your costume (prizes await the most creative!)</li>
                  <li>Practice your best villain laugh</li>
                  <li>Bring your appetite for twisted treats</li>
                  <li>Come ready for scavenger hunts, games, and surprises</li>
                  <li>Don''t forget your camera for the photo booth!</li>
                </ul>
              </div>

              <p style="margin: 24px 0 0 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                See you soon in the dark and twisted realm!
              </p>

              <p style="margin: 16px 0 0 0; color: #b8a8c8; font-size: 14px; line-height: 1.6;">
                The Ruths<br>
                <em>Your Wicked Hosts</em>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
              <p style="margin: 0; color: #b8a8c8; font-size: 13px; line-height: 1.6; text-align: center;">
                {{event_date}} • {{event_time}}<br>
                {{event_address}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@twistedtale.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Template 3: Final 48-Hour Countdown
INSERT INTO public.email_templates (name, subject, preview_text, html_content, is_active, created_by)
VALUES (
  'Final 48-Hour Countdown',
  '⏰ 48 Hours Until Twisted Tale - Last Minute Details!',
  'The countdown is on! Here''s everything you need to know for Friday night...',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>48 Hour Countdown - Twisted Tale</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Georgia'', serif; background: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: rgba(26, 15, 46, 0.6); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; color: #d4af37; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3); letter-spacing: 1px;">
                🎭 Twisted Tale
              </h1>
              <p style="margin: 10px 0 0 0; color: #e8d4a8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                The Ruths'' Fairytale Halloween Bash
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(138, 43, 226, 0.3)); border-radius: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 10px 0; color: #d4af37; font-size: 48px; font-weight: 700;">
                  ⏰ 48 Hours
                </h2>
                <p style="margin: 0; color: #ffffff; font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">
                  Until the Magic Begins
                </p>
              </div>
              
              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                Dear {{name}},
              </p>

              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                The portal to our twisted realm opens in just 48 hours! Here are the final details to ensure your journey is seamless:
              </p>

              <div style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #d4af37; font-size: 18px; font-weight: 600;">
                  📍 Event Details
                </h3>
                <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 15px; line-height: 1.6;">
                  <strong>When:</strong> {{event_date}} at {{event_time}}<br>
                  <strong>Where:</strong> {{event_address}}<br>
                  <strong>Guests:</strong> You + {{num_guests}} guest(s)
                </p>
              </div>

              <div style="background: rgba(138, 43, 226, 0.1); border-left: 4px solid #8a2be2; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #b8a8c8; font-size: 18px; font-weight: 600;">
                  🎭 What to Expect
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #ffffff; font-size: 15px; line-height: 1.8;">
                  <li>🏆 Costume contest with amazing prizes</li>
                  <li>🔍 Interactive scavenger hunt throughout the venue</li>
                  <li>🍸 Signature twisted cocktails and mocktails</li>
                  <li>🎲 Spooky games and challenges</li>
                  <li>📸 Professional photo booth with fairytale props</li>
                  <li>🎵 Hauntingly good music all night</li>
                </ul>
              </div>

              <div style="background: rgba(212, 175, 55, 0.15); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; color: #d4af37; font-size: 16px; font-weight: 600;">
                  🍽️ Dietary Note
                </p>
                <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px;">
                  We''ve noted: {{dietary_restrictions}}
                </p>
              </div>

              <p style="margin: 24px 0 0 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                The clock is ticking... Are you ready?
              </p>

              <p style="margin: 16px 0 0 0; color: #b8a8c8; font-size: 14px; line-height: 1.6;">
                See you in the darkness,<br>
                The Ruths
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
              <p style="margin: 0; color: #b8a8c8; font-size: 13px; line-height: 1.6; text-align: center;">
                {{event_date}} • {{event_time}}<br>
                {{event_address}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@twistedtale.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Template 4: Day-Of Welcome
INSERT INTO public.email_templates (name, subject, preview_text, html_content, is_active, created_by)
VALUES (
  'Day-Of Welcome',
  '🌙 Tonight''s the Night - Welcome to Twisted Tale!',
  'The portal opens tonight! Here''s your final guide to the evening...',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Day-Of Welcome - Twisted Tale</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Georgia'', serif; background: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: rgba(26, 15, 46, 0.6); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; color: #d4af37; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3); letter-spacing: 1px;">
                🎭 Twisted Tale
              </h1>
              <p style="margin: 10px 0 0 0; color: #e8d4a8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                The Ruths'' Fairytale Halloween Bash
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(138, 43, 226, 0.3)); border-radius: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 10px 0; color: #d4af37; font-size: 42px; font-weight: 700;">
                  🌙 Tonight''s the Night!
                </h2>
                <p style="margin: 0; color: #ffffff; font-size: 16px;">
                  The twisted realm awaits your arrival
                </p>
              </div>
              
              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; line-height: 1.6; font-weight: 600;">
                Good {{name}},
              </p>

              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                The hour has arrived! Tonight, you''ll step through the portal into our twisted fairytale world. We''re thrilled to welcome you!
              </p>

              <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(138, 43, 226, 0.2)); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #d4af37; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                  Join Us At
                </p>
                <p style="margin: 0 0 4px 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                  {{event_time}}
                </p>
                <p style="margin: 0; color: #e8d4a8; font-size: 16px;">
                  {{event_address}}
                </p>
              </div>

              <div style="background: rgba(212, 175, 55, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #d4af37; font-size: 18px; font-weight: 600;">
                  ⭐ Tonight''s Highlights:
                </h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #d4af37; font-size: 24px; width: 40px;">🏆</td>
                    <td style="color: #ffffff; font-size: 15px; line-height: 1.6;">
                      <strong>Costume Contest</strong><br>
                      Show off your twisted creativity!
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #d4af37; font-size: 24px; width: 40px;">🔮</td>
                    <td style="color: #ffffff; font-size: 15px; line-height: 1.6;">
                      <strong>Rune Scavenger Hunt</strong><br>
                      Unlock mysteries throughout the venue
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #d4af37; font-size: 24px; width: 40px;">🍸</td>
                    <td style="color: #ffffff; font-size: 15px; line-height: 1.6;">
                      <strong>Signature Libations</strong><br>
                      Twisted cocktails and treats await
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #d4af37; font-size: 24px; width: 40px;">📸</td>
                    <td style="color: #ffffff; font-size: 15px; line-height: 1.6;">
                      <strong>Photo Magic</strong><br>
                      Capture memories in our enchanted booth
                    </td>
                  </tr>
                </table>
              </div>

              <div style="background: rgba(138, 43, 226, 0.15); border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; color: #b8a8c8; font-size: 14px; font-style: italic;">
                  💜 Don''t forget to check in when you arrive to claim your welcome gift!
                </p>
              </div>

              <p style="margin: 24px 0 0 0; color: #ffffff; font-size: 16px; line-height: 1.6; text-align: center; font-weight: 600;">
                See you tonight in the twisted realm!
              </p>

              <p style="margin: 16px 0 0 0; color: #b8a8c8; font-size: 14px; line-height: 1.6; text-align: center;">
                The Ruths<br>
                <em>Your Enchanted Hosts</em>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
              <p style="margin: 0; color: #b8a8c8; font-size: 13px; line-height: 1.6; text-align: center;">
                {{event_date}} • {{event_time}}<br>
                {{event_address}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@twistedtale.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Template 5: Thank You & Photo Gallery Invite
INSERT INTO public.email_templates (name, subject, preview_text, html_content, is_active, created_by)
VALUES (
  'Thank You & Photo Gallery Invite',
  '✨ Thank You for Making Twisted Tale Magical!',
  'What an enchanted evening! View photos and relive the magic...',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - Twisted Tale</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Georgia'', serif; background: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: rgba(26, 15, 46, 0.6); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; color: #d4af37; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3); letter-spacing: 1px;">
                🎭 Twisted Tale
              </h1>
              <p style="margin: 10px 0 0 0; color: #e8d4a8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                The Ruths'' Fairytale Halloween Bash
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 28px; font-weight: 600; text-align: center;">
                ✨ Thank You, {{name}}!
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                What an enchanted evening! We''re still buzzing from the magic you all brought to our twisted realm.
              </p>

              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                From the incredible costumes to the laughter echoing through the venue, each moment was absolutely spellbinding. Thank you for making Twisted Tale unforgettable!
              </p>

              <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(138, 43, 226, 0.2)); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <h3 style="margin: 0 0 12px 0; color: #d4af37; font-size: 22px; font-weight: 600;">
                  📸 Relive the Magic
                </h3>
                <p style="margin: 0 0 20px 0; color: #ffffff; font-size: 15px; line-height: 1.6;">
                  The photos are ready! Browse through the gallery, share your favorites, and upload your own memories from the night.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="{{gallery_link}}" 
                         style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); color: #1a0f2e; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);">
                        🖼️ View Photo Gallery
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="background: rgba(212, 175, 55, 0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #d4af37; font-size: 18px; font-weight: 600;">
                  🌟 Share Your Memories
                </h3>
                <p style="margin: 0 0 12px 0; color: #ffffff; font-size: 15px; line-height: 1.6;">
                  We''d love to see your favorite shots from the night! Upload them to the gallery and leave messages in our digital guestbook.
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #ffffff; font-size: 15px; line-height: 1.8;">
                  <li>React to your favorite photos with emojis</li>
                  <li>Leave comments and share memories</li>
                  <li>Download photos for your own collection</li>
                  <li>Tag yourself and friends</li>
                </ul>
              </div>

              <div style="background: rgba(138, 43, 226, 0.15); border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #b8a8c8; font-size: 16px; font-weight: 600;">
                  💜 Until Next Year...
                </p>
                <p style="margin: 0; color: #ffffff; font-size: 14px; line-height: 1.6; font-style: italic;">
                  Keep an eye out for next year''s theme announcement!
                </p>
              </div>

              <p style="margin: 24px 0 0 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                With gratitude and magic,
              </p>

              <p style="margin: 8px 0 0 0; color: #b8a8c8; font-size: 14px; line-height: 1.6;">
                The Ruths<br>
                <em>Your Forever Enchanted Hosts</em>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
              <p style="margin: 0; color: #b8a8c8; font-size: 13px; line-height: 1.6; text-align: center;">
                {{event_date}} • Forever in Our Hearts<br>
                {{event_address}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@twistedtale.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Template 6: RSVP Confirmation
INSERT INTO public.email_templates (name, subject, preview_text, html_content, is_active, created_by)
VALUES (
  'RSVP Confirmation',
  '🎉 Your RSVP is Confirmed - Welcome to Twisted Tale!',
  'Your spot is reserved! Here''s what to expect at the party...',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Confirmed - Twisted Tale</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Georgia'', serif; background: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: rgba(26, 15, 46, 0.6); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; color: #d4af37; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3); letter-spacing: 1px;">
                🎭 Twisted Tale
              </h1>
              <p style="margin: 10px 0 0 0; color: #e8d4a8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                The Ruths'' Fairytale Halloween Bash
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(138, 43, 226, 0.3)); border-radius: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 10px 0; color: #d4af37; font-size: 36px; font-weight: 700;">
                  🎉 You''re In!
                </h2>
                <p style="margin: 0; color: #ffffff; font-size: 16px;">
                  Your spot in the twisted realm is reserved
                </p>
              </div>
              
              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; line-height: 1.6; font-weight: 600;">
                Congratulations, {{name}}!
              </p>

              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                Your RSVP has been confirmed! We''re thrilled you''ll be joining us for an unforgettable night of twisted fairytale magic.
              </p>

              <div style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #d4af37; font-size: 18px; font-weight: 600;">
                  📅 Your Reservation Details
                </h3>
                <table width="100%" cellpadding="6" cellspacing="0">
                  <tr>
                    <td style="color: #b8a8c8; font-size: 14px; width: 140px;">Guest Name:</td>
                    <td style="color: #ffffff; font-size: 15px; font-weight: 600;">{{name}}</td>
                  </tr>
                  <tr>
                    <td style="color: #b8a8c8; font-size: 14px;">Email:</td>
                    <td style="color: #ffffff; font-size: 15px;">{{email}}</td>
                  </tr>
                  <tr>
                    <td style="color: #b8a8c8; font-size: 14px;">Party Size:</td>
                    <td style="color: #ffffff; font-size: 15px;">{{num_guests}} guest(s)</td>
                  </tr>
                  <tr>
                    <td style="color: #b8a8c8; font-size: 14px;">Date & Time:</td>
                    <td style="color: #ffffff; font-size: 15px;">{{event_date}} at {{event_time}}</td>
                  </tr>
                  <tr>
                    <td style="color: #b8a8c8; font-size: 14px;">Location:</td>
                    <td style="color: #ffffff; font-size: 15px;">{{event_address}}</td>
                  </tr>
                  <tr>
                    <td style="color: #b8a8c8; font-size: 14px;">RSVP Status:</td>
                    <td style="color: #4ade80; font-size: 15px; font-weight: 600;">✓ Confirmed</td>
                  </tr>
                </table>
              </div>

              <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(138, 43, 226, 0.2)); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #d4af37; font-size: 18px; font-weight: 600;">
                  ✨ What to Expect
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #ffffff; font-size: 15px; line-height: 1.8;">
                  <li><strong>Twisted Fairytale Costumes</strong> - Come dressed as your favorite dark reimagined character</li>
                  <li><strong>Rune Scavenger Hunt</strong> - Unlock mysteries and win prizes</li>
                  <li><strong>Photo Booth Magic</strong> - Professional photos with enchanted props</li>
                  <li><strong>Signature Libations</strong> - Custom cocktails and treats</li>
                  <li><strong>Games & Contests</strong> - Including our famous costume competition</li>
                </ul>
              </div>

              <div style="background: rgba(138, 43, 226, 0.15); border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; color: #b8a8c8; font-size: 14px;">
                  💡 <em>Pro tip: Start planning your costume now - creativity wins prizes!</em>
                </p>
              </div>

              <p style="margin: 24px 0 0 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                We''ll send more details as the event approaches. Can''t wait to see you there!
              </p>

              <p style="margin: 16px 0 0 0; color: #b8a8c8; font-size: 14px; line-height: 1.6;">
                With excitement,<br>
                The Ruths<br>
                <em>Your Twisted Tale Hosts</em>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
              <p style="margin: 0; color: #b8a8c8; font-size: 13px; line-height: 1.6; text-align: center;">
                {{event_date}} • {{event_time}}<br>
                {{event_address}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@twistedtale.com' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Template 7: RSVP Waitlist
INSERT INTO public.email_templates (name, subject, preview_text, html_content, is_active, created_by)
VALUES (
  'RSVP Waitlist',
  '⏳ You''re on the Waitlist for Twisted Tale',
  'We received your RSVP! You''re currently on our waitlist...',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Waitlist - Twisted Tale</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Georgia'', serif; background: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #000000; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: rgba(26, 15, 46, 0.6); backdrop-filter: blur(10px); border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);">
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; color: #d4af37; font-size: 32px; font-weight: 700; text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3); letter-spacing: 1px;">
                🎭 Twisted Tale
              </h1>
              <p style="margin: 10px 0 0 0; color: #e8d4a8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                The Ruths'' Fairytale Halloween Bash
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px;">
              <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(138, 43, 226, 0.2)); border-radius: 16px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 10px 0; color: #d4af37; font-size: 36px; font-weight: 700;">
                  ⏳ You''re On the List!
                </h2>
                <p style="margin: 0; color: #ffffff; font-size: 16px;">
                  Currently on our magical waitlist
                </p>
              </div>
              
              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; line-height: 1.6; font-weight: 600;">
                Hello {{name}},
              </p>

              <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                Thank you for your interest in Twisted Tale! We''ve received your RSVP and added you to our waitlist.
              </p>

              <div style="background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 12px 0; color: #d4af37; font-size: 18px; font-weight: 600;">
                  📋 Your Waitlist Details
                </h3>
                <table width="100%" cellpadding="6" cellspacing="0">
                  <tr>
                    <td style="color: #b8a8c8; font-size: 14px; width: 140px;">Name:</td>
                    <td style="color: #ffffff; font-size: 15px;">{{name}}</td>
                  </tr>
                  <tr>
                    <td style="color: #b8a8c8; font-size: 14px;">Email:</td>
                    <td style="color: #ffffff; font-size: 15px;">{{email}}</td>
                  </tr>
                  <tr>
                    <td style="color: #b8a8c8; font-size: 14px;">Requested Guests:</td>
                    <td style="color: #ffffff; font-size: 15px;">{{num_guests}}</td>
                  </tr>
                  <tr>
                    <td style="color: #b8a8c8; font-size: 14px;">Status:</td>
                    <td style="color: #fbbf24; font-size: 15px; font-weight: 600;">⏳ Waitlist</td>
                  </tr>
                </table>
              </div>

              <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(138, 43, 226, 0.2)); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #d4af37; font-size: 18px; font-weight: 600;">
                  🔮 What Happens Next?
                </h3>
                <p style="margin: 0 0 12px 0; color: #ffffff; font-size: 15px; line-height: 1.6;">
                  Our twisted realm has limited space, but we''re monitoring the guest list closely. If a spot opens up, you''ll be the first to know!
                </p>
                <p style="margin: 0; color: #e8d4a8; font-size: 14px; line-height: 1.6; font-style: italic;">
                  We typically send waitlist updates 1-2 weeks before the event.
                </p>
              </div>

              <div style="background: rgba(138, 43, 226, 0.15); border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; color: #b8a8c8; font-size: 16px; font-weight: 600;">
                  💡 In the Meantime...
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #ffffff; font-size: 14px; line-height: 1.8;">
                  <li>Keep this email for your records</li>
                  <li>Start brainstorming costume ideas (just in case!)</li>
                  <li>Watch for updates in your inbox</li>
                  <li>Follow along on social media for event teasers</li>
                </ul>
              </div>

              <p style="margin: 24px 0 0 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                We''ll keep you updated and hope to see you at the party!
              </p>

              <p style="margin: 16px 0 0 0; color: #b8a8c8; font-size: 14px; line-height: 1.6;">
                Fingers crossed,<br>
                The Ruths<br>
                <em>Your Hopeful Hosts</em>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
              <p style="margin: 0; color: #b8a8c8; font-size: 13px; line-height: 1.6; text-align: center;">
                {{event_date}} • {{event_time}}<br>
                {{event_address}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@twistedtale.com' LIMIT 1)
) ON CONFLICT DO NOTHING;