import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { sp } from '@pnp/sp/presets/all';
import OrgTree from './OrgTree';
import { IOrgItem } from '../models/IOrgItem';
import styles from './OrgChartApp.module.scss';

export interface IOrgChartAppProps {
  listName: string;
  context: WebPartContext;
}

const OrgChartApp: React.FC<IOrgChartAppProps> = ({ listName }) => {
  const [items, setItems] = React.useState<IOrgItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await sp.web.lists.getByTitle(listName)
          .items.select('Id','Title','Position','ManagerId','Role','Photo','Order','Department')
          .orderBy('Order', true)
          .get();
        if (mounted) {
          setItems(raw as IOrgItem[]);
        }
      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [listName]);

  if (loading) {
    return <div className={styles.loading}>Loading org chart...</div>;
  }
  if (error) {
    return <div className={styles.error}>Error loading org chart: {error}</div>;
  }
  if (!items.length) {
    return <div className={styles.empty}>No items found in list "{listName}".</div>;
  }

  return (
    <div className={styles.container}>
      <OrgTree items={items} />
    </div>
  );
};

export default OrgChartApp;