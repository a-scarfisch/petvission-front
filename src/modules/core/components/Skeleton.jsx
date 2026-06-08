const Skeleton = ({ width = '100%', height = '16px', radius = '6px', style }) => (
  <div className="sk-bone" style={{ width, height, borderRadius: radius, ...style }} />
)

export default Skeleton
