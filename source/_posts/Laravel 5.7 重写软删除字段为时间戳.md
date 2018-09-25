---
id: laravel-model-override-soft-delete
date: 2018-09-25 13:47:38
title: Laravel 5.7 重写软删除字段为时间戳
categories: wtf
---

## 0x00 背景

Laravel 自带软删除使用特殊值 `NULL` 表示此记录未被删除。由此引出一个问题。

设想，某表内需要建立索引，索引字段为 `name`, `deleted_at`。

假设此索引条件必定唯一，可建立 `Uniuqe` 索引。然而 `deleted_at` 允许 `NULL` 存在，导致索引无效，在查询时降级为 `Index`。

因此，在绝大多数场景下，我们查询未被删除（`deleted_at IS NULL`）的数据，唯一索引都没有卵用。

```
mysql> EXPLAIN SELECT * FROM `my_tbl`;
+----+-------------+--------+------------+-------+---------------+-----------------+---------+------+------+----------+-------------+
| id | select_type | table  | partitions | type  | possible_keys | key             | key_len | ref  | rows | filtered | Extra       |
+----+-------------+--------+------------+-------+---------------+-----------------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | my_tbl | NULL       | index | NULL          | name_deleted_at | 38      | NULL |    2 |   100.00 | Using index |
+----+-------------+--------+------------+-------+---------------+-----------------+---------+------+------+----------+-------------+
1 row in set, 1 warning (0.00 sec)
```

于是，一个想法在脑海里浮现 —— 重写软删除字段为整型时间戳。

## 0x01 准备

Check list:

- [ ] Migrations
- [ ] `SoftDeletingScope`
- [ ] `SoftDeletes` Trait
- [ ] ???

## 0x02 Migrations

简单。

新建一个 Service Provider，或者直接在 `AppServiceProvider` 的 `boot` 方法内添加：

```php
Blueprint::macro('mySoftDeletes', function () {
    $this->unsignedBigInteger('deleted_at')->default(0);
});
```

在 Migration 中使用 `Schema` Facade 创建表时，回调函数的参数会被传入一个 `Blueprint` 实例；而 `Blueprint` 使用了 `Macroable` Trait，所以我们可以任意扩展宏方法；详细可阅读 [Laravel 5.6 给 Blueprint 增加自定义方法](/snippets/laravel-blueprint-macro)。

## 0x03 SoftDeletingScope

新建一个 Class，实现 `Scope` 接口即可。

```php
namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class MySoftDeletingScope implements Scope
{
    /**
     * All of the extensions to be added to the builder.
     *
     * @var array
     */
    protected $extensions = ['Restore', 'WithTrashed', 'WithoutTrashed', 'OnlyTrashed'];

    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @return void
     */
    public function apply(Builder $builder, Model $model)
    {
        $builder->where($model->getQualifiedDeletedAtColumn(), '=', 0);
    }

    /**
     * Extend the query builder with the needed functions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @return void
     */
    public function extend(Builder $builder)
    {
        foreach ($this->extensions as $extension) {
            $this->{"add{$extension}"}($builder);
        }

        $builder->onDelete(function (Builder $builder) {
            $column = $this->getDeletedAtColumn($builder);

            return $builder->update([
                $column => $builder->getModel()->freshTimestamp()->timestamp,
            ]);
        });
    }

    /**
     * Get the "deleted at" column for the builder.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @return string
     */
    protected function getDeletedAtColumn(Builder $builder)
    {
        if (count((array) $builder->getQuery()->joins) > 0) {
            return $builder->getModel()->getQualifiedDeletedAtColumn();
        }

        return $builder->getModel()->getDeletedAtColumn();
    }

    /**
     * Add the restore extension to the builder.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @return void
     */
    protected function addRestore(Builder $builder)
    {
        $builder->macro('restore', function (Builder $builder) {
            $builder->withTrashed();

            return $builder->update([$builder->getModel()->getDeletedAtColumn() => 0]);
        });
    }

    /**
     * Add the with-trashed extension to the builder.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @return void
     */
    protected function addWithTrashed(Builder $builder)
    {
        $builder->macro('withTrashed', function (Builder $builder, $withTrashed = true) {
            if (! $withTrashed) {
                return $builder->withoutTrashed();
            }

            return $builder->withoutGlobalScope($this);
        });
    }

    /**
     * Add the without-trashed extension to the builder.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @return void
     */
    protected function addWithoutTrashed(Builder $builder)
    {
        $builder->macro('withoutTrashed', function (Builder $builder) {
            $model = $builder->getModel();

            $builder->withoutGlobalScope($this)->where(
                $model->getQualifiedDeletedAtColumn(),
                '=',
                0
            );

            return $builder;
        });
    }

    /**
     * Add the only-trashed extension to the builder.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $builder
     * @return void
     */
    protected function addOnlyTrashed(Builder $builder)
    {
        $builder->macro('onlyTrashed', function (Builder $builder) {
            $model = $builder->getModel();

            $builder->withoutGlobalScope($this)->where(
                $model->getQualifiedDeletedAtColumn(),
                '<>',
                0
            );

            return $builder;
        });
    }
}
```

`SoftDeletingScope` 的作用，是在模型的查询内加入「未删除」或「已删除」等特定条件，详情可参考 [官方文档](https://laravel.com/docs/5.7/eloquent#global-scopes)。

> Writing your own global scopes can provide a convenient, easy way to make sure every query for a given model receives certain constraints. - Laravel 5.7 Documentation

另外，这里我并没有继承 Eloquent 的 `SoftDeletingScope`，原因有三：

- 原代码改动不方便，几乎所有方法都需要覆盖重写。
- 项目后期升级框架版本，不希望框架代码的改动影响此处。
- 根据官方文档对于 `Global Scope` 的解释，软删除即是利用它实现。所以实际上 `Scope` 是一项明确开放的特性；你可以想象为我们正在利用 `Scope` 自行实现软删除。

## 0x04 SoftDeletes Trait

新建一个 Trait，代码比较长，如下。

```php
namespace App\Traits;

use App\Scopes\MySoftDeletingScope;
use Illuminate\Database\Eloquent\SoftDeletes;

trait MySoftDeletes
{
    use SoftDeletes;

    /**
     * Boot the soft deleting trait for a model.
     *
     * @return void
     */
    public static function bootSoftDeletes()
    {
        static::addGlobalScope(new MySoftDeletingScope());
    }

    /**
     * Perform the actual delete query on this model instance.
     *
     * @return void
     */
    protected function runSoftDelete()
    {
        $query = $this->newModelQuery()->where($this->getKeyName(), $this->getKey());

        $time = $this->freshTimestamp();

        $columns = [$this->getDeletedAtColumn() => $time->timestamp];

        $this->{$this->getDeletedAtColumn()} = $time;

        if ($query->update($columns)) {
            $this->syncOriginal();
        }
    }

    /**
     * Restore a soft-deleted model instance.
     *
     * @return bool|null
     */
    public function restore()
    {
        // If the restoring event does not return false, we will proceed with this
        // restore operation. Otherwise, we bail out so the developer will stop
        // the restore totally. We will clear the deleted timestamp and save.
        if ($this->fireModelEvent('restoring') === false) {
            return false;
        }

        $this->{$this->getDeletedAtColumn()} = 0;

        // Once we have saved the model, we will fire the "restored" event so this
        // developer will do anything they need to after a restore operation is
        // totally finished. Then we will return the result of the save call.
        $this->exists = true;

        $result = $this->save();

        $this->fireModelEvent('restored', false);

        return $result;
    }

    /**
     * Determine if the model instance has been soft-deleted.
     *
     * @return bool
     */
    public function trashed()
    {
        return $this->{$this->getDeletedAtColumn()} != 0;
    }
}
```

`SoftDeletes` 的作用是赋予模型查询时，使用更加语义化命名的方法，查询「未删除」、「已删除」等特定条件的模型；同时，在 `bootSoftDeletes` 方法内，挂载上一步定义的 `Global Scope`。

注意：Trait 不可以继承，但可以嵌套、覆盖。所以此处我 `use SoftDeletes`，并重写其中部分方法实现。

## 0x05 Surprise...

Check list 的最后一条，Laravel 给我们留了个惊喜。

`SoftDelete` 特性并不是完全解耦的。除了刚刚几处非常明显需要修改的地方之外，还有一处隐藏很深的暗坑。

今天在使用 `HasManyThrough` 时，发现一个奇葩问题，查询的 SQL 经过调试输出，发现依然有 `IS NULL` 的查询条件。

经过一番排查，发现在 `Illuminate\Database\Eloquent\Relations\HasManyThrough` 内有一方法 `throughParentSoftDeletes` 🤔。

又有两方法 `performJoin`、`getRelationExistenceQueryForSelfRelation` 利用如上方法，判断模型是否 `use SoftDeletes`；若已 `use`，则 `whereNull`。

好气啊！

于是，你还需要进行两步。

1. 在模型内（或者你可以创建个公共基类，或者也可以写在单独的 Trait 中）重写 `newHasManyThrough` 方法，创建自定义的模型关系类。

    ```php
    protected function newHasManyThrough(Builder $query, Model $farParent, Model $throughParent, $firstKey, $secondKey, $localKey, $secondLocalKey)
    {
        return new MyHasManyThrough($query, $farParent, $throughParent, $firstKey, $secondKey, $localKey, $secondLocalKey);
    }
    ```

2. 新建如上 `MyHasManyThrough` 类，重写那两个坑爹的方法，替换 `whereNull`。

    ```php
    use Illuminate\Database\Eloquent\Builder;
    use Illuminate\Database\Eloquent\Relations\HasManyThrough;

    class MyHasManyThrough extends HasManyThrough
    {
        protected function performJoin(Builder $query = null)
        {
            $query = $query ?: $this->query;

            $farKey = $this->getQualifiedFarKeyName();

            $query->join($this->throughParent->getTable(), $this->getQualifiedParentKeyName(), '=', $farKey);

            if ($this->throughParentSoftDeletes()) {
                $query->where($this->throughParent->getQualifiedDeletedAtColumn(), '=', 0);
            }
        }

        public function getRelationExistenceQueryForSelfRelation(Builder $query, Builder $parentQuery, $columns = ['*'])
        {
            $query->from($query->getModel()->getTable().' as '.$hash = $this->getRelationCountHash());

            $query->join($this->throughParent->getTable(), $this->getQualifiedParentKeyName(), '=', $hash.'.'.$this->secondLocalKey);

            if ($this->throughParentSoftDeletes()) {
                $query->where($this->throughParent->getQualifiedDeletedAtColumn(), '=', 0);
            }

            $query->getModel()->setTable($hash);

            return $query->select($columns)->whereColumn(
                $parentQuery->getQuery()->from.'.'.$this->localKey, '=', $this->getQualifiedFirstKeyName()
            );
        }
    }
    ```

## 0xFF 感想

终于，在修改这么多类之后，我们实现了用整型时间戳代替 `DATETIME + NULL` 实现软删除。

若后期发现有其它的坑，填满再继续回来补充。
