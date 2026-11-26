import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'

// PC: 마우스로 8px 이상 끌면 드래그 시작 (기존과 동일)
// 모바일: 0.25초 꾹 누르면 드래그 시작 (그냥 스크롤/탭은 그대로 동작)
export default function useDragSensors() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  )
}
