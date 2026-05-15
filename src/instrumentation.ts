export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: cron } = await import('node-cron')
    const { runCleanup } = await import('./lib/cleanup')

    // Run cleanup every hour
    cron.schedule('0 * * * *', async () => {
      console.log('[CRON] Running cleanup job...')
      await runCleanup()
    })

    console.log('[CRON] Cleanup job scheduled (every hour)')
  }
}
