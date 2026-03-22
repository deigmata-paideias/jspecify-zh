/*
 * Copyright 2022 The JSpecify Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureListSvg = [
  {
    title: '标准注解',
    Svg: require('@site/static/img/jspecify-landing-annot.svg').default,
    description: (
      <>
	JSpecify 发布了首个工具无关的注解 artifact，用于驱动 Java 代码中的静态分析检查。
      </>
    ),
  },
  {
    title: '新一代静态分析',
    Svg: require('@site/static/img/jspecify-landing-bugs.svg').default,
    description: (
      <>
	JSpecify 定义了精确的语义，让分析工具能够更一致地发现更多 bug。库的所有者不必再决定支持哪个工具。
      </>
    ),
  },
];

const FeatureListPng = [
  {
    title: '社区协作',
    Png: require('@site/static/img/jspecify-landing-community.png').default,
    description: (
      <>
        JSpecify 由代表 Java 静态分析领域各方利益相关者的成员通过共识开发，我们欢迎您的参与。
      </>
    ),
  },
];


function FeatureSvg({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function FeaturePng({Png, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={Png} className={styles.featureSvg} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureListSvg.map((props, idx) => (
            <FeatureSvg key={idx} {...props} />
          ))}
          {FeatureListPng.map((props, idx) => (
            <FeaturePng key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}