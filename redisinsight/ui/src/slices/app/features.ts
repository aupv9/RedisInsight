import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove } from 'lodash'
import { BrowserStorageItem } from 'uiSrc/constants'
import { BUILD_FEATURES } from 'uiSrc/constants/featuresHighlighting'
import { localStorageService } from 'uiSrc/services'
import { StateAppFeatures } from 'uiSrc/slices/interfaces'
import { AppDispatch, RootState } from 'uiSrc/slices/store'
import { getPagesForFeatures } from 'uiSrc/utils/highlighting'
import { OnboardingSteps } from 'uiSrc/constants/onboarding'
import { Maybe } from 'uiSrc/utils'

export const initialState: StateAppFeatures = {
  highlighting: {
    version: '',
    features: [],
    pages: {}
  },
  onboarding: {
    currentStep: 0,
    totalSteps: 0,
    isActive: false,
  }
}

const appFeaturesSlice = createSlice({
  name: 'appFeatures',
  initialState,
  reducers: {
    setFeaturesInitialState: () => initialState,
    setFeaturesToHighlight: (state, { payload }: { payload: { version: string, features: string[] } }) => {
      state.highlighting.features = payload.features
      state.highlighting.version = payload.version
      state.highlighting.pages = getPagesForFeatures(payload.features)
    },
    removeFeatureFromHighlighting: (state, { payload }: { payload: string }) => {
      remove(state.highlighting.features, (f) => f === payload)

      const pageName = BUILD_FEATURES[payload].page
      if (pageName && pageName in state.highlighting.pages) {
        remove(state.highlighting.pages[pageName], (f) => f === payload)
      }

      const { version, features } = state.highlighting
      localStorageService.set(BrowserStorageItem.featuresHighlighting, { version, features })
    },
    setOnboarding: (state, { payload }) => {
      if (payload.currentStep > payload.totalSteps) {
        localStorageService.set(BrowserStorageItem.onboardingStep, null)
        return
      }

      state.onboarding.currentStep = payload.currentStep ?? 0
      state.onboarding.totalSteps = payload.totalSteps
      state.onboarding.isActive = true
      localStorageService.set(BrowserStorageItem.onboardingStep, payload.currentStep ?? 0)
    },
    skipOnboarding: (state) => {
      state.onboarding.isActive = false
      localStorageService.set(BrowserStorageItem.onboardingStep, null)
    },
    setOnboardPrevStep: (state) => {
      const { currentStep, isActive } = state.onboarding
      if (!isActive) return

      const step = currentStep > 0 ? currentStep - 1 : 0
      state.onboarding.currentStep = step

      localStorageService.set(BrowserStorageItem.onboardingStep, step)
    },
    setOnboardNextStep: (state, { payload = 0 }: PayloadAction<Maybe<number>>) => {
      const { currentStep, isActive } = state.onboarding
      if (!isActive) return

      const step = currentStep + 1 + payload
      state.onboarding.currentStep = step

      if (state.onboarding.currentStep > state.onboarding.totalSteps) {
        state.onboarding.isActive = false
        localStorageService.set(BrowserStorageItem.onboardingStep, null)
        return
      }

      localStorageService.set(BrowserStorageItem.onboardingStep, step)
    }
  }
})

export const {
  setFeaturesInitialState,
  setFeaturesToHighlight,
  removeFeatureFromHighlighting,
  skipOnboarding,
  setOnboardPrevStep,
  setOnboardNextStep,
  setOnboarding
} = appFeaturesSlice.actions

export const appFeatureSelector = (state: RootState) => state.app.features
export const appFeatureHighlightingSelector = (state: RootState) => state.app.features.highlighting
export const appFeaturePagesHighlightingSelector = (state: RootState) => state.app.features.highlighting.pages

export const appFeatureOnboardingSelector = (state: RootState) => state.app.features.onboarding

export default appFeaturesSlice.reducer

export function incrementOnboardStepAction(step: OnboardingSteps, skipCount = 0, onSuccess?: () => void) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { currentStep, isActive } = state.app.features.onboarding
    if (isActive && currentStep === step) {
      dispatch(setOnboardNextStep(skipCount))
      onSuccess?.()
    }
  }
}
