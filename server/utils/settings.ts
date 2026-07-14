import { Settings } from '~/models/Settings.model'

export async function getOrCreateSettings() {
  let settings = await Settings.findOne()
  if (!settings) {
    const year = new Date().getFullYear()
    settings = await Settings.create({
      currentSession: `${year}/${year + 1}`,
      currentTerm: 'First'
    })
  }
  return settings
}
