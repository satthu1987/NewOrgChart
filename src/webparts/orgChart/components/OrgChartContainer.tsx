import * as React from 'react';
import { getOrgItems } from '../services/spService';
import { IOrgItem } from '../models/IOrgItem';
import OrgTree from './OrgTree';
import styles from './OrgChartContainer.module.scss';

interface OrgChartContainerProps {
  usListName: string;
  vnListName: string;
}

type TabKey = 'us' | 'vn';

const OrgChartContainer: React.FC<OrgChartContainerProps> = ({ usListName, vnListName }) => {
  const [activeTab, setActiveTab] = React.useState<TabKey>('us');
  const [usItems, setUsItems] = React.useState<IOrgItem[]>([]);
  const [vnItems, setVnItems] = React.useState<IOrgItem[]>([]);
  const [usLoading, setUsLoading] = React.useState(false);
  const [vnLoading, setVnLoading] = React.useState(false);
  const [usError, setUsError] = React.useState<string | null>(null);
  const [vnError, setVnError] = React.useState<string | null>(null);

  // Fetch helper
  const fetchItems = async (listName: string): Promise<IOrgItem[]> => {
    const r = await getOrgItems(listName) as any;
    const rawArray = Array.isArray(r) ? r : (r?.value && Array.isArray(r.value) ? r.value : []);

    return rawArray.map((it: any) => {
      const id = it.Id ?? it.ID ?? it.id;

      let managerId: number | string | null = null;
      if (typeof it.ManagerId === 'number' || typeof it.ManagerId === 'string') managerId = it.ManagerId;
      else if (it.Manager && (it.Manager.Id ?? it.Manager.ID) != null) managerId = it.Manager.Id ?? it.Manager.ID;

      const extractSrc = (html?: string) => {
        if (!html || typeof html !== 'string') return undefined;
        const m = html.match(/src=(?:'|")([^'"]+)(?:'|")/i);
        return m ? m[1] : undefined;
      };

      let photoUrl: string | undefined;
      const showPhoto = it.ShowPhoto === true || it.ShowPhoto === 'true' || it.ShowPhoto === 1;
      if (showPhoto) {
        if (typeof it.PhotoUrl === 'string') photoUrl = extractSrc(it.PhotoUrl) ?? it.PhotoUrl;
        else if (typeof it.PhotoURL === 'string') photoUrl = extractSrc(it.PhotoURL) ?? it.PhotoURL;
        else if (it.PhotoUrl && typeof it.PhotoUrl === 'object') photoUrl = it.PhotoUrl.Url ?? it.PhotoUrl.ServerRelativeUrl ?? undefined;
        else if (it.PhotoURL && typeof it.PhotoURL === 'object') photoUrl = it.PhotoURL.Url ?? it.PhotoURL.ServerRelativeUrl ?? undefined;
        if (photoUrl?.startsWith('/')) {
          photoUrl = `${window.location.origin}${photoUrl}`;
        }
      }

      return {
        Id: id,
        Title: it.Title ?? '',
        JobTitle: it.JobTitle ?? '',
        ManagerId: managerId ?? null,
        Branch: it.Branch ?? '',
        PhotoURL: photoUrl,
        SortOrder: it.SortOrder ?? 0,
        PageURL: it.PageUrl ?? it.PageURL ?? '',
        IsLeaf:it.IsLeaf,
        ShowPhoto:it.ShowPhoto
      } as IOrgItem;
    });
  };

  // Load US data
  React.useEffect(() => {
    let mounted = true;
    setUsLoading(true);
    fetchItems(usListName)
      .then(data => { if (mounted) setUsItems(data); })
      .catch(err => { if (mounted) setUsError(err.message || String(err)); })
      .finally(() => { if (mounted) setUsLoading(false); });
    return () => { mounted = false; };
  }, [usListName]);

  // Load VN data
  React.useEffect(() => {
    let mounted = true;
    setVnLoading(true);
    fetchItems(vnListName)
      .then(data => { if (mounted) setVnItems(data); })
      .catch(err => { if (mounted) setVnError(err.message || String(err)); })
      .finally(() => { if (mounted) setVnLoading(false); });
    return () => { mounted = false; };
  }, [vnListName]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'us', label: 'Enterprise Services US' },
    { key: 'vn', label: 'Enterprise Services Vietnam' },
  ];

  const isLoading = activeTab === 'us' ? usLoading : vnLoading;
  const error = activeTab === 'us' ? usError : vnError;
  const items = activeTab === 'us' ? usItems : vnItems;

  return (
    <div className={styles.root}>
      {/* Tab bar */}
      <div className={styles.tabBar}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.tabContent}>
        {isLoading && <div className={styles.status}>Loading org chart…</div>}
        {!isLoading && error && <div className={styles.status}>Error: {error}</div>}
        {!isLoading && !error && items.length === 0 && (
          <div className={styles.status}>No org data found.</div>
        )}
        {!isLoading && !error && items.length > 0 && (
          <OrgTree items={items} activeTab={activeTab} />
        )}
      </div>
    </div>
  );
};

export default OrgChartContainer;