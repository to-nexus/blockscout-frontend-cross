try {
  const bannerConfig = JSON.parse(process.env.NEXT_PUBLIC_HOMEPAGE_HERO_BANNER_CONFIG?.replaceAll('\'', '"') || '{}');
  const data = {
    title: `${ process.env.NEXT_PUBLIC_NETWORK_NAME } explorer`,
    logo_url: process.env.NEXT_PUBLIC_NETWORK_LOGO_DARK ?? process.env.NEXT_PUBLIC_NETWORK_LOGO,
    background: bannerConfig.background?.[0],
    title_color: bannerConfig.text_color?.[0],
    invert_logo: !process.env.NEXT_PUBLIC_NETWORK_LOGO_DARK,
  };

  // CROSS
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); 

  console.log('⏳ Making request to OG image generator service...');
  const response = await fetch('https://bigs.services.blockscout.com/generate/og', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal: controller.signal 
  });

  // CROSS
  clearTimeout(timeoutId);

  if (response.ok) {
    console.log('⬇️  Downloading the image...');
    const buffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);
    fs.writeFileSync(targetFile, imageBuffer);
  } else {
    const payload = response.headers.get('Content-type')?.includes('application/json') 
      ? await response.json() 
      : await response.text();
    console.error('🛑 Failed to generate OG image. Response:', payload);
    console.log('Copying placeholder image...');
    copyPlaceholderImage();
  }
} catch (error) {
  // AbortError와 일반 에러 구분 가능
  if (error.name === 'AbortError') {
    console.error('🛑 OG image generation timed out');
  } else {
    console.error('🛑 Failed to generate OG image. Error:', error?.message);
  }
  console.log('Copying placeholder image...');
  copyPlaceholderImage();
}