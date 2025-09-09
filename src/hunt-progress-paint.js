// CSS Houdini Paint API Worklet for Hunt Progress Ring
// This creates a custom paint worklet for the scavenger hunt progress ring

class HuntProgressPainter {
  static get inputProperties() {
    return [
      '--progress',
      '--color',
      '--size',
      '--thickness',
      '--background-color',
      '--progress-color'
    ];
  }

  paint(ctx, size, properties) {
    const progress = parseFloat(properties.get('--progress')) || 0;
    const color = properties.get('--color') || '#3B6E47';
    const sizeValue = parseFloat(properties.get('--size')) || 60;
    const thickness = parseFloat(properties.get('--thickness')) || 4;
    const backgroundColor = properties.get('--background-color') || '#1A1F3A';
    const progressColor = properties.get('--progress-color') || color;

    // Calculate center and radius
    const centerX = size.width / 2;
    const centerY = size.height / 2;
    const radius = Math.min(sizeValue, Math.min(size.width, size.height)) / 2 - thickness / 2;

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = backgroundColor;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw progress arc
    if (progress > 0) {
      const startAngle = -Math.PI / 2; // Start at top
      const endAngle = startAngle + (2 * Math.PI * progress);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = progressColor;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Add glow effect for progress
      if (progress > 0.1) {
        ctx.shadowColor = progressColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Add center text if space allows
    if (radius > 20) {
      const text = `${Math.round(progress * 100)}%`;
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.max(12, radius / 4)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, centerX, centerY);
    }
  }
}

// Register the paint worklet
registerPaint('hunt-progress', HuntProgressPainter);
