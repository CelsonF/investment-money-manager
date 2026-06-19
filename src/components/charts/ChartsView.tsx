import { useLocaleStore } from '../../store/localeStore'
import type { ChartDatum } from '../../types'
import ChartBlock from './ChartBlock'

interface ChartsViewProps {
  byCount: Array<ChartDatum>
  byValue: Array<ChartDatum>
  total: number
  hasQuantity: boolean
}

export default function ChartsView({ byCount, byValue, total, hasQuantity }: ChartsViewProps) {
  const { money, t } = useLocaleStore()

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <ChartBlock
        title={t('overview.byCount')}
        data={byCount}
        totalRef={byCount.reduce((s, d) => s + d.value, 0)}
        centerLabel={t('overview.assets')}
        format={(v) => `${v}`}
      />
      {hasQuantity && byValue.length > 0 && (
        <ChartBlock
          title={t('overview.byValue')}
          data={byValue}
          totalRef={total}
          centerLabel={t('overview.total')}
          format={money}
        />
      )}
    </div>
  )
}
