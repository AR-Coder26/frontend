import * as React from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /**
   * Below the `md` breakpoint, render every row as a labelled card instead of a wide scrolling
   * table. Each <TableCell> must then carry a `label` (shown as the field name on its left).
   * At `md` and above nothing changes. Default: false (plain horizontally-scrollable table).
   */
  stackOnMobile?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, stackOnMobile = false, ...props }, ref) => (
    <div
      data-stack={stackOnMobile ? 'true' : undefined}
      className={cn(
        'group/table w-full overflow-x-auto rounded-lg border border-border',
        stackOnMobile && 'max-md:overflow-visible max-md:rounded-none max-md:border-0'
      )}
    >
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', 'group-data-[stack=true]/table:max-md:block', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('bg-muted/60 [&_tr]:border-b [&_tr]:border-border', 'group-data-[stack=true]/table:max-md:hidden', className)} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', 'group-data-[stack=true]/table:max-md:block', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border transition-colors hover:bg-muted/40',
        // stacked-card mode (see Table): one bordered card per row on small screens
        'group-data-[stack=true]/table:max-md:block group-data-[stack=true]/table:max-md:mb-3 group-data-[stack=true]/table:max-md:rounded-lg group-data-[stack=true]/table:max-md:border group-data-[stack=true]/table:max-md:bg-card group-data-[stack=true]/table:max-md:p-3 group-data-[stack=true]/table:max-md:shadow-sm',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-11 whitespace-nowrap px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Field name shown beside the value when the table is stacked on mobile (stackOnMobile). */
  label?: string;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, label, ...props }, ref) => (
    <td
      ref={ref}
      data-label={label}
      className={cn(
        'px-4 py-3 align-middle',
        // stacked-card mode: "LABEL ........ value" rows
        'group-data-[stack=true]/table:max-md:flex group-data-[stack=true]/table:max-md:items-center group-data-[stack=true]/table:max-md:justify-between group-data-[stack=true]/table:max-md:gap-3 group-data-[stack=true]/table:max-md:px-1 group-data-[stack=true]/table:max-md:py-1.5 group-data-[stack=true]/table:max-md:text-right group-data-[stack=true]/table:max-md:max-w-none group-data-[stack=true]/table:max-md:whitespace-normal',
        'group-data-[stack=true]/table:max-md:before:shrink-0 group-data-[stack=true]/table:max-md:before:text-left group-data-[stack=true]/table:max-md:before:text-xs group-data-[stack=true]/table:max-md:before:font-medium group-data-[stack=true]/table:max-md:before:uppercase group-data-[stack=true]/table:max-md:before:tracking-wide group-data-[stack=true]/table:max-md:before:text-muted-foreground group-data-[stack=true]/table:max-md:before:content-[attr(data-label)]',
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };