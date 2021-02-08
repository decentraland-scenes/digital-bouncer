import * as ui from '@dcl/ui-scene-utils'
import { getUserData, UserData } from '@decentraland/Identity'
import { isPreviewMode } from '@decentraland/EnvironmentAPI'

import { movePlayerTo } from '@decentraland/RestrictedActions'

export let userData: UserData

export async function fetchUserData() {
  const data = await getUserData()
  if (data) {
    log(data.displayName)
  }
  return data
}

export async function setUserData() {
  const data = await getUserData()
  if (data) {
    log(data.displayName)
    userData = data
  }
}

export let allowListedIds = ['SceneAdmin', 'ToonPunk']

export const sceneMessageBus = new MessageBus()

let announceUI: ui.FillInPrompt

let bouncerUI: ui.FillInPrompt

export async function initiateVJUI() {
  if (!userData) {
    await setUserData()
  }

  let authorized = false

  if (await isPreviewMode()) {
    authorized = true
  } else {
    for (let id of allowListedIds) {
      if (userData && id == userData.displayName) {
        authorized = true
        break
      }
    }
  }

  if (authorized) {
    announceUI = new ui.FillInPrompt(
      'Announcements',
      (e: string) => {
        sceneMessageBus.emit('announcement', {
          text: e,
        })
      },
      'Send',
      'Announcement',
      true
    )
    announceUI.hide()

    bouncerUI = new ui.FillInPrompt(
      'Digital Bouncer',
      (e: string) => {
        sceneMessageBus.emit('kick', {
          player: e,
        })
      },
      'Kick',
      'player name',
      true
    )
    bouncerUI.hide()

    Input.instance.subscribe(
      'BUTTON_DOWN',
      ActionButton.PRIMARY,
      false,
      (e) => {
        if (announceUI) {
          if (!announceUI.background.visible) {
            announceUI.show()
          } else {
            announceUI.hide()
          }
        }
      }
    )

    Input.instance.subscribe(
      'BUTTON_DOWN',
      ActionButton.SECONDARY,
      false,
      (e) => {
        if (bouncerUI) {
          if (!bouncerUI.background.visible) {
            bouncerUI.show()
          } else {
            bouncerUI.hide()
          }
        }
      }
    )
  }
}

sceneMessageBus.on('announcement', (e) => {
  ui.displayAnnouncement(e.text)
})

sceneMessageBus.on('kick', async (e) => {
  if (!userData) {
    await setUserData()
  }

  // if (e.player == userData.displayName) {
  movePlayerTo({ x: 0, y: 5, z: 0 })
  // }
})
